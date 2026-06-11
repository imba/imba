# [preview=styles]
import 'util/styles'
export const vars = {flag: 'demo-md'}

# ---
css .demo-xxs fs:xxs # 10px
css .demo-xs fs:xs  # 12px
css .demo-sm fs:sm # 14px
css .demo-md fs:md # 16px
css .demo-lg fs:lg # 18px
css .demo-xl fs:xl # 20px
css .demo-2xl fs:2xl # 24px
css .demo-3xl fs:3xl # 30px
css .demo-4xl fs:4xl # 36px
css .demo-5xl fs:5xl # 48px
css .demo-6xl fs:6xl # 64px
# ---

imba.mount do <.inline-demo.typography>
	<div.{vars.flag}> 'Text'