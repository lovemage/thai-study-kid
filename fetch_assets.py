import urllib.request, re, json, pathlib, concurrent.futures, io
from PIL import Image
ROOT=pathlib.Path(__file__).parent/'dist'/'assets'
ROOT.mkdir(exist_ok=True)
BASE='https://seasite.niu.edu/Thai/'
def fetch(i):
    page=urllib.request.urlopen(BASE+f'basic/c{i:02}_details.htm',timeout=35).read().decode('latin1')
    match=re.search(r'src="(\.\./consonants/animations/[^"]+)"',page,re.I)
    url=urllib.parse.urljoin(BASE+'basic/',match[1])
    raw=urllib.request.urlopen(url,timeout=35).read()
    gif=Image.open(io.BytesIO(raw)); frames=[]; times=[]
    for f in range(getattr(gif,'n_frames',1)):
        gif.seek(f); frames.append(gif.convert('RGBA').copy()); times.append(gif.info.get('duration',100))
    sheet=Image.new('RGBA',(gif.width*len(frames),gif.height),'white')
    for f,im in enumerate(frames): sheet.paste(im,(f*gif.width,0))
    sheet.save(ROOT/f'writing-{i}.png')
    sound=re.search(r'href="([^"]+\.mp3)"',page,re.I)
    audio=urllib.request.urlopen(urllib.parse.urljoin(BASE+'basic/',sound[1]),timeout=35).read()
    (ROOT/f'letter-{i}.mp3').write_bytes(audio)
    return str(i),dict(width=gif.width,height=gif.height,frames=len(frames),durations=times,source=url)
if __name__=='__main__':
    result={}
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        jobs={pool.submit(fetch,i):i for i in range(1,45)}
        for job in concurrent.futures.as_completed(jobs):
            i=jobs[job]
            try: k,v=job.result();result[k]=v;print(i,'ok',flush=True)
            except Exception as e: print(i,'FAILED',str(e),flush=True)
    (ROOT/'writing.json').write_text(json.dumps(result))
