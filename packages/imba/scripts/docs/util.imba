import fs from 'fs'

export class Dts
	name
	stack = []
	out = ''
	pre = ''

	def w ln
		out += pre + ln + '\n'
		self

	def br
		w('')
		self

	def ind wrap,cb
		push(wrap)
		cb()
		pop!
		self

	def push wrap
		w(wrap + ' {') if wrap
		pre += '\t'
		self

	def doc
		w('/**')
		pre += ' * '
		self

	def undoc
		pre = pre.slice(0,-3)
		w('*/')
		self

	def pop wrap
		pre = pre.slice(0,-1)
		w('}\n')
		self

	def save
		yes

	def end
		pop! while pre.length > 0
		self

	def toString
		out