# copy($$('.js-label-link').map(v=> `{name: '${v.textContent.trim()}', color: '${v.style.backgroundColor}'}`).join('\n'))
export const labels = [
	{name: 'bug', color: 'rgb(252, 41, 41)'}
	{name: 'duplicate', color: 'rgb(204, 204, 204)'}
	{name: 'help wanted', color: 'rgb(21, 152, 24)'}
	{name: 'invalid', color: 'rgb(230, 230, 230)'}
	{name: 'question', color: 'rgb(204, 49, 124)'}
	{name: 'wontfix', color: 'rgb(255, 255, 255)'}
]

export const data = {
	imba: {name: 'Imba', url: 'https://imba.io', color: '#4fd1c5'}
	vue: {name: 'Vue', url: 'https://vuejs.org', color: '#4fc08d'}
	svelte: {name: 'Svelte', url: 'https://svelte.dev', color: '#ff3e00'}
	react: {name: 'React', url: 'https://reactjs.org', color: '#61dafb'}
	ember: {name: 'Ember', url: 'https://emberjs.com', color: '#e04e39'}
}

export const projects = [data.imba,data.vue,data.svelte,data.react]
