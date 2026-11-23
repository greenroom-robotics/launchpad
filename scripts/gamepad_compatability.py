#!/usr/bin/env python3
"""List the gamepads Chromium maps to the W3C "standard" layout, per OS.

Parses `device/gamepad/` from the Chromium tag pinned by Electron, and names devices
using usb.ids. Standard library only. Run via `npm run generate:gamepads` or
`npm run check:gamepads` (fails if the committed JSON is for a different Chromium).
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import re
import subprocess
import sys
import urllib.request
from dataclasses import dataclass
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_JSON = REPO_ROOT / "packages" / "renderer" / "src" / "data" / "gamepads.json"
DEFAULT_MD = REPO_ROOT / "docs" / "gamepads.md"
USB_IDS_URL = "http://www.linux-usb.org/usb.ids"
BASE_URL = "https://chromium.googlesource.com/chromium/src/+/refs/tags/{tag}/device/gamepad/{name}?format=TEXT"

HEX4 = r"([0-9a-f]{4})"
USB_VENDOR_RE = re.compile(HEX4 + r"\s+(.+)")  # 045e  Microsoft Corp.
USB_PRODUCT_RE = re.compile(r"\t" + HEX4 + r"\s+(.+)")  # <tab>028e  Xbox360 Controller
GAMEPAD_ID_RE = re.compile(r"\b(k\w+)\s*=\s*0x" + HEX4 + HEX4 + r"\b", re.I)  # kSonyProduct0ce6 = 0x054c0ce6
ID_LIST_ROW_RE = re.compile(r"\{\{0x" + HEX4 + r",\s*0x" + HEX4 + r"\},\s*kXInputType(\w+)\}")  # {{0x045e, 0x028e}, kXInputTypeXbox360}
MAPPING_ROW_RE = re.compile(r"\{GamepadId::(\w+),\s*(\w+)\}")  # {GamepadId::kSonyProduct0ce6, MapperDualSense}


def fetch_cached(url: str, path: Path, *, base64_encoded: bool = False, refresh: bool = False) -> str:
    if refresh or not path.exists():
        with urllib.request.urlopen(url, timeout=60) as resp:
            data = resp.read()
        if base64_encoded:
            data = base64.b64decode(data)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(data.decode("utf-8", errors="replace"))
    return path.read_text()


class ChromiumSource:
    """Cached reader for `device/gamepad/` files at a Chromium tag."""

    def __init__(self, tag: str, cache_dir: Path):
        self.tag = tag
        self.cache_dir = cache_dir

    @classmethod
    def from_electron(cls, electron_dir: Path, cache_dir: Path) -> "ChromiumSource":
        binary = electron_dir / "dist" / ("electron.exe" if os.name == "nt" else "electron")
        if not binary.exists():
            sys.exit(f"Electron binary not found at {binary}; run npm install or pass --chromium")
        env = {**os.environ, "ELECTRON_RUN_AS_NODE": "1"}
        out = subprocess.run(
            [str(binary), "-p", "process.versions.chrome"],
            capture_output=True, text=True, env=env, check=True,
        )
        return cls(out.stdout.strip(), cache_dir)

    def read(self, name: str) -> str:
        url = BASE_URL.format(tag=self.tag, name=name)
        return fetch_cached(url, self.cache_dir / self.tag / name, base64_encoded=True)


class UsbIds:
    """Vendor and product names from usb.ids (not pinned to the Chromium version)."""

    def __init__(self, text: str):
        self.vendors: dict[int, str] = {}
        self.products: dict[tuple[int, int], str] = {}
        vendor = None
        for line in text.splitlines():
            if line.startswith("#") or not line.strip():
                continue
            if not line[0].isspace():
                m = USB_VENDOR_RE.match(line)
                if not m:
                    break  # device class section
                vendor = int(m[1], 16)
                self.vendors[vendor] = m[2].strip()
            elif vendor is not None:
                m = USB_PRODUCT_RE.match(line)
                if m:
                    self.products[(vendor, int(m[1], 16))] = m[2].strip()

    @classmethod
    def load(cls, cache_dir: Path, refresh: bool = False) -> "UsbIds":
        return cls(fetch_cached(USB_IDS_URL, cache_dir / "usb.ids", refresh=refresh))


@dataclass(frozen=True)
class Entry:
    vendor_id: int
    product_id: int
    description: str  # label from Chromium's mapping table, if any
    mapper: str
    source: str  # mapping-table | xinput-fallback | xinput-id-list

    @property
    def key(self) -> tuple[int, int]:
        return (self.vendor_id, self.product_id)


@dataclass(frozen=True)
class DeviceInfo:
    vendor_name: str
    xinput: str  # none | xbox | xbox360 | xboxone


class GamepadCatalog:
    """Chromium's device ids and XInput types, plus usb.ids names."""

    def __init__(self, source: ChromiumSource, usb_ids: UsbIds):
        self.usb_ids = usb_ids
        self.ids = self._parse_gamepad_ids(source.read("gamepad_id_list.h"))
        self.info = self._parse_id_list(source.read("gamepad_id_list.cc"))

    @staticmethod
    def _parse_gamepad_ids(header: str) -> dict[str, tuple[int, int]]:
        """`kMicrosoftProduct0b13 = 0x045e0b13` -> {'kMicrosoftProduct0b13': (0x045e, 0x0b13)}."""
        return {name: (int(vid, 16), int(pid, 16)) for name, vid, pid in GAMEPAD_ID_RE.findall(header)}

    @staticmethod
    def _parse_id_list(source: str) -> dict[tuple[int, int], DeviceInfo]:
        """Parse kGamepadInfo rows like `{{0x045e, 0x028e}, kXInputTypeXbox360},`."""
        vendor = ""
        info = {}
        for line in source[source.index("kGamepadInfo"):].splitlines():
            line = line.strip()
            if line.startswith("//"):
                vendor = line[2:].strip()
                continue
            m = ID_LIST_ROW_RE.match(line)
            if m:
                info[(int(m[1], 16), int(m[2], 16))] = DeviceInfo(vendor, m[3].lower())
            elif line.startswith("});"):
                break
        return info

    def vendor_name(self, key: tuple[int, int]) -> str:
        """usb.ids name, falling back to the vendor comment in gamepad_id_list.cc."""
        name = self.usb_ids.vendors.get(key[0])
        if name:
            return name
        info = self.info.get(key)
        return info.vendor_name if info else ""

    def product_name(self, key: tuple[int, int]) -> str:
        return self.usb_ids.products.get(key, "")

    def xinput_devices(self, *types: str) -> list[tuple[int, int]]:
        """Devices of the given XInput types, or of any type if none are given."""
        return [
            key for key, info in self.info.items()
            if (info.xinput in types if types else info.xinput != "none")
        ]


class Platform:
    """One OS: its `kAvailableMappings` table, plus `extra_entries()` for other sources."""

    name: str
    mapping_file: str

    def __init__(self, source: ChromiumSource, catalog: GamepadCatalog):
        self.source = source
        self.catalog = catalog

    def collect(self) -> list[Entry]:
        entries = {e.key: e for e in self._mapping_table()}
        for e in self.extra_entries():
            entries.setdefault(e.key, e)  # table entries win
        return sorted(entries.values(), key=lambda e: e.key)

    def extra_entries(self) -> list[Entry]:
        return []

    def _mapping_table(self) -> list[Entry]:
        source = self.source.read(self.mapping_file)
        start = source.index("kAvailableMappings[]")
        end = source.index("};", start)
        comments: list[str] = []
        entries = []
        for line in source[start:end].splitlines()[1:]:
            line = line.strip()
            if line.startswith("//"):
                comments.append(line[2:].strip())
                continue
            m = MAPPING_ROW_RE.match(line)
            if not m:
                continue
            gid, mapper = m.groups()
            if gid in self.catalog.ids:
                vid, pid = self.catalog.ids[gid]
                entries.append(Entry(vid, pid, " ".join(comments), mapper, "mapping-table"))
            else:
                print(f"warning: {gid} not found in GamepadId enum", file=sys.stderr)
            comments = []
        return entries


class LinuxPlatform(Platform):
    name = "linux"
    mapping_file = "gamepad_standard_mappings_linux.cc"

    def extra_entries(self) -> list[Entry]:
        # Linux falls back to MapperXInputStyleGamepad for these when no mapper matches.
        return [
            Entry(*key, "", "MapperXInputStyleGamepad", "xinput-fallback")
            for key in self.catalog.xinput_devices("xbox360", "xboxone")
        ]


class MacPlatform(Platform):
    name = "mac"
    mapping_file = "gamepad_standard_mappings_mac.mm"


class WindowsPlatform(Platform):
    name = "windows"
    mapping_file = "gamepad_standard_mappings_win.cc"

    def extra_entries(self) -> list[Entry]:
        # The XInput and WGI fetchers always give the standard layout; the id list's
        # XInput devices are the closest static approximation.
        return [Entry(*key, "", "XInput", "xinput-id-list") for key in self.catalog.xinput_devices()]


PLATFORMS: list[type[Platform]] = [LinuxPlatform, MacPlatform, WindowsPlatform]

NOTES = """\
## Notes

- Names come from usb.ids (not pinned to the Chromium version). `Name` is Chromium's own label, else the usb.ids product.
- `mapping-table`: explicit entry in Chromium's mapping table for that OS.
- `xinput-fallback` (Linux) and `xinput-id-list` (Windows): inferred from the XInput devices in `gamepad_id_list.cc`. Real coverage is larger (Linux `xpad`, Windows XInput/WGI).
- Not listed: USB Xbox devices handled by the macOS Xbox fetcher. Some devices are only standard over USB or on certain firmware.
"""


class Report:
    def __init__(self, source: ChromiumSource, usb_ids: UsbIds):
        catalog = GamepadCatalog(source, usb_ids)
        self.chromium = source.tag
        self.catalog = catalog
        self.platforms = {p.name: p(source, catalog).collect() for p in PLATFORMS}

    def display_name(self, e: Entry) -> str:
        """Chromium's label, then the usb.ids product, then the raw VID:PID."""
        return e.description or self.catalog.product_name(e.key) or f"{e.vendor_id:04x}:{e.product_id:04x}"

    def rows(self, platform: str) -> list[dict]:
        return [
            {
                "name": self.display_name(e),
                "vendor_id": f"{e.vendor_id:04x}",
                "product_id": f"{e.product_id:04x}",
                "vendor": self.catalog.vendor_name(e.key),
                "product": self.catalog.product_name(e.key),
                "mapper": e.mapper,
                "source": e.source,
            }
            for e in self.platforms[platform]
        ]

    def to_json(self) -> str:
        data = {"chromium": self.chromium, "platforms": {n: self.rows(n) for n in self.platforms}}
        return json.dumps(data, indent=2) + "\n"

    def to_markdown(self) -> str:
        out = [
            "# Chromium standard-mapped gamepads\n",
            "> **Generated file, do not edit by hand.** Run `npm run generate:gamepads` "
            "(`scripts/gamepad_compatability.py`) to update it.\n",
            f"Chromium `{self.chromium}`\n",
        ]
        for name in self.platforms:
            rows = self.rows(name)
            out.append(f"\n## {name.capitalize()} ({len(rows)} devices)\n")
            out.append("| VID:PID | Vendor | Name | USB name | Mapper | Source |")
            out.append("|---|---|---|---|---|---|")
            for r in rows:
                out.append(
                    f"| `{r['vendor_id']}:{r['product_id']}` | {r['vendor']} | {r['name']} | {r['product']} "
                    f"| `{r['mapper']}` | {r['source']} |"
                )
        out.append("\n" + NOTES)
        return "\n".join(out)


def check(args: argparse.Namespace) -> int:
    pinned = args.chromium or ChromiumSource.from_electron(args.electron_dir, args.cache_dir).tag
    path = args.json_out
    if not path.exists():
        print(f"error: {path} does not exist; run `npm run generate:gamepads`", file=sys.stderr)
        return 1
    committed = json.loads(path.read_text()).get("chromium")
    if committed != pinned:
        print(
            f"error: {path.relative_to(REPO_ROOT)} is for Chromium {committed}, but Electron pins {pinned}.\n"
            "Run `npm run generate:gamepads` and commit the result.",
            file=sys.stderr,
        )
        return 1
    print(f"OK: gamepad data matches pinned Chromium {pinned}")
    return 0


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--chromium", help="Chromium version/tag (default: detected from Electron)")
    ap.add_argument("--electron-dir", type=Path, default=REPO_ROOT / "node_modules" / "electron")
    ap.add_argument("--cache-dir", type=Path, default=Path.home() / ".cache" / "gamepad-compat")
    ap.add_argument("--refresh-usb-ids", action="store_true", help="Re-download usb.ids even if cached")
    ap.add_argument(
        "--check",
        action="store_true",
        help="Offline check: fail if the committed JSON was generated for a different Chromium than the pinned Electron",
    )
    ap.add_argument("--json-out", type=Path, default=DEFAULT_JSON, help="JSON path (also the file --check reads)")
    ap.add_argument("--md-out", type=Path, default=DEFAULT_MD, help="Markdown path")
    args = ap.parse_args()

    if args.check:
        sys.exit(check(args))

    source = (
        ChromiumSource(args.chromium, args.cache_dir)
        if args.chromium
        else ChromiumSource.from_electron(args.electron_dir, args.cache_dir)
    )
    report = Report(source, UsbIds.load(args.cache_dir, args.refresh_usb_ids))

    for path, text in ((args.json_out, report.to_json()), (args.md_out, report.to_markdown() + "\n")):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
        print(f"Wrote {path}")
    print(f"Chromium {report.chromium}")


if __name__ == "__main__":
    main()
