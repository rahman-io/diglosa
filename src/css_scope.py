import re
def split_top(sel):
    parts=[];depth=0;cur=''
    for ch in sel:
        if ch in '([': depth+=1
        elif ch in ')]': depth-=1
        if ch==',' and depth==0: parts.append(cur);cur=''
        else: cur+=ch
    parts.append(cur)
    return [p.strip() for p in parts if p.strip()]
def prefix_sel(sel,skin,container=None):
    pre=f'html[data-skin="{skin}"]'
    if container:
        if sel.startswith(':root') or sel.startswith('*') or re.match(r'^(html|body)(?![\w-])',sel): return None
        return pre+' '+container+' '+sel
    if sel.startswith(':root'): return pre+sel[5:]
    if re.match(r'^html(?![\w-])',sel): return pre+sel[4:]
    return pre+' '+sel
def scope(css,skin,keep_keyframes=False,container=None):
    css=re.sub(r'/\*.*?\*/','',css,flags=re.S)
    out=[];i=0;n=len(css)
    while i<n:
        j=css.find('{',i)
        if j==-1: break
        prelude=css[i:j].strip()
        depth=1;k=j+1
        while k<n and depth:
            if css[k]=='{':depth+=1
            elif css[k]=='}':depth-=1
            k+=1
        body=css[j+1:k-1]
        if prelude.startswith('@media') or prelude.startswith('@supports'):
            inner=scope(body,skin,keep_keyframes,container)
            if inner.strip(): out.append(prelude+'{'+inner+'}')
        elif prelude.startswith('@keyframes'):
            if keep_keyframes: out.append(prelude+'{'+body+'}')
        elif prelude.startswith('@'):
            out.append(prelude+'{'+body+'}')
        else:
            sels=[x for x in (prefix_sel(s,skin,container) for s in split_top(prelude)) if x]
            if sels: out.append(','.join(sels)+'{'+body+'}')
        i=k
    return '\n'.join(out)
def extract_style(path):
    s=open(path,encoding='utf-8').read()
    a=s.index('<style>')+7; b=s.index('</style>')
    return s[a:b]
