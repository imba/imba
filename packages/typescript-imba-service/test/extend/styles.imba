%div test d=hflex fw=bold cursor=pointer

# hello
def render
	%tab d=block

%tab div
	d.active=block

	div d=again
	%test d=block

%tab div d=block

tag LocalApp

	<self[d=block zi=1 hover=2px]>

# $$('.style.property.operator').forEach(v=> v.innerText = '=')

%tab fl=none