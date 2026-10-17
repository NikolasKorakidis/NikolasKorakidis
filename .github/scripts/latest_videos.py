"""Writes the channel's latest uploads into README.md between the YOUTUBE markers.

The channel ID is looked up from the @handle each run, so nothing needs configuring.
"""
import html, re, sys, urllib.request
import xml.etree.ElementTree as ET

HANDLE = "sleepinggianttv"
COUNT = 6
UA = {"User-Agent": "Mozilla/5.0", "Accept-Language": "en"}

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read().decode("utf-8", "replace")

page = get(f"https://www.youtube.com/@{HANDLE}")
m = re.search(r'"(?:externalId|channelId)":"(UC[\w-]{22})"', page) or re.search(r"channel/(UC[\w-]{22})", page)
if not m:
    sys.exit("Could not find the channel ID on the channel page")
feed = ET.fromstring(get(f"https://www.youtube.com/feeds/videos.xml?channel_id={m.group(1)}"))
ns = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}
videos = [(e.find("yt:videoId", ns).text, e.find("a:title", ns).text) for e in feed.findall("a:entry", ns)][:COUNT]
if not videos:
    sys.exit("The feed has no videos")

# A 3-wide grid of thumbnails, each linking to its video, with the title underneath
cells = [f'<td width="33%" align="center"><a href="https://www.youtube.com/watch?v={vid}"><img src="https://i.ytimg.com/vi/{vid}/hqdefault.jpg" alt="{html.escape(title, quote=True)}"/></a><br/><sub>{html.escape(title)}</sub></td>'
         for vid, title in videos]
rows = "".join("<tr>" + "".join(cells[i:i + 3]) + "</tr>" for i in range(0, len(cells), 3))
block = f"<!-- YOUTUBE:START -->\n<table>{rows}</table>\n<!-- YOUTUBE:END -->"

readme = open("README.md", encoding="utf-8").read()
new = re.sub(r"<!-- YOUTUBE:START -->.*?<!-- YOUTUBE:END -->", block, readme, flags=re.S)
if new != readme:
    open("README.md", "w", encoding="utf-8").write(new)
    print(f"Updated with {len(videos)} videos")
else:
    print("No change")
