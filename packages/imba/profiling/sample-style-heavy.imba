###
Synthetic style-heavy compile sample.
Designed to stress CSS/style lexing, style AST construction, style traversal,
and stylesheet generation more than tag or logic volume.
###

tag style-heavy-dashboard < op-view

	css
		pos:relative
		d:vss
		g:18px
		p:24px
		w:100%
		h:100%
		bg:#101318
		c:#f4f7fb
		container-type:inline-size
		overflow:hidden

		$surface
			pos:absolute
			inset:0
			bg:linear-gradient(180deg,#17202b,#101318)
			rd:12px
			bd:1px solid #293241
			bxs:0 24px 80px #000/35

		$header
			pos:relative
			d:hcb
			g:12px
			p:18px 20px
			bg:#151d26
			rd:10px
			bd:1px solid #2d3745
			bxs:0 8px 30px #000/20

			.title
				ff:system
				fs:24px
				fw:700
				lh:1.1
				c:#ffffff
				ls:0

			.meta
				d:hcc
				g:8px
				fs:12px
				c:#9badc2
				text-transform:uppercase

			.badge
				px:8px
				py:3px
				rd:999px
				bg:#2b425f
				c:#c7e4ff
				bd:1px solid #5d7fa7

		$grid
			pos:relative
			d:grid
			grid-template-columns:repeat(4,minmax(0,1fr))
			g:14px

			@@<900
				grid-template-columns:repeat(2,minmax(0,1fr))

			@@<520
				grid-template-columns:1fr

		$card
			pos:relative
			d:vss
			g:12px
			p:16px
			miw:0
			rd:8px
			bg:#17212d
			bd:1px solid #2d3a49
			bxs:0 12px 32px #000/20
			transition:transform 160ms ease, border-color 160ms ease, background 160ms ease

			@hover
				y:-2px
				bg:#1b2836
				bc:#3e5168

			&.critical
				bg:#2b181d
				bc:#814152
				c:#ffdbe4

			&.warning
				bg:#2a2417
				bc:#816a39
				c:#fff0c2

			&.calm
				bg:#142722
				bc:#386f61
				c:#d2fff5

			.label
				fs:11px
				fw:700
				text-transform:uppercase
				c:#8fa4bb

			.value
				fs:32px
				fw:800
				lh:1
				c:#ffffff

			.delta
				d:hcc
				g:6px
				fs:13px
				c:#99e2bd

			.spark
				h:42px
				rd:6px
				bg:linear-gradient(90deg,#446dff,#4ed8b4)
				mask:linear-gradient(180deg,#000,#0000)

		$list
			pos:relative
			d:vss
			g:10px
			p:16px
			rd:10px
			bg:#151d26
			bd:1px solid #2d3745

			.item
				d:hcb
				g:12px
				p:10px 12px
				rd:7px
				bg:#101820
				bd:1px solid #253142

				@hover
					bg:#172330
					bc:#42556d

				.name
					fs:14px
					fw:650
					c:#edf4ff

				.value
					fs:13px
					c:#9badc2

				.status
					s:8px
					rd:999px
					bg:#4ed8b4

				&.off .status
					bg:#ff6d8b

				&.slow .status
					bg:#ffd166

		$matrix
			d:grid
			grid-template-columns:repeat(12,1fr)
			g:4px
			p:12px
			rd:8px
			bg:#111923
			bd:1px solid #273346

			.cell
				aspect-ratio:1
				rd:3px
				bg:#233148
				transition:background 120ms ease, transform 120ms ease

				@hover
					raw-scale:1.18

				&.a bg:#294b73
				&.b bg:#376d79
				&.c bg:#3b8066
				&.d bg:#746936
				&.e bg:#7d3e4d

		$footer
			d:hcb
			g:10px
			p:12px 16px
			rd:8px
			bg:#111923
			bd:1px solid #273346
			c:#9badc2

			button
				px:10px
				py:6px
				rd:6px
				bg:#203148
				c:#dbe9ff
				bd:1px solid #3b5578

				@hover
					bg:#2d4361

	def render
		<self>
			<$surface>
			<$header>
				<div.title> "Style heavy"
				<div.meta>
					<span.badge> "css"
					<span> "many declarations"
			<$grid>
				for kind in ['critical','warning','calm','normal','normal','calm','warning','critical']
					<div.card .critical=(kind == 'critical') .warning=(kind == 'warning') .calm=(kind == 'calm')>
						<div.label> kind
						<div.value> "128"
						<div.delta> "+4.8%"
						<div.spark>
			<$list>
				for state in ['on','slow','on','off','on','slow']
					<div.item .off=(state == 'off') .slow=(state == 'slow')>
						<div>
							<div.name> "worker"
							<div.value> state
						<div.status>
			<$matrix>
				for val in ['a','b','c','d','e','a','b','c','d','e','a','b','c','d','e','a','b','c','d','e','a','b','c','d']
					<div.cell .a=(val == 'a') .b=(val == 'b') .c=(val == 'c') .d=(val == 'd') .e=(val == 'e')>
			<$footer>
				<span> "synthetic"
				<button> "Refresh"
