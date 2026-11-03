class PredicateDefaults
	reads = 0
	active = yes

	get ready?
		reads++
		active

	def matches? expected = yes
		active == expected

	def read value = ready?
		value

	def check value = matches?
		value

	def from target, value = target..ready?
		value

	def from-call make, value = make!..ready?
		value

	def from-arguments target, value = arguments[0]..ready?
		value

	def pair value = ready?
		[value, ready?]

	def first [value = ready?] = []
		value

	def named {value = self.ready?} = {}
		value

	def reader
		do(value = ready?) value

class InheritedPredicateDefaults < PredicateDefaults
	def inherited value = super.ready?
		value

	def inherited-match value = super.matches?
		value

test 'predicate defaults run only for omitted or undefined arguments' do
	let reader = new PredicateDefaults
	eq reader.read!, yes
	eq reader.read(undefined), yes
	eq reader.read(no), no
	eq reader.read(null), null
	eq reader.reads, 2
	reader.active = no
	eq reader.read!, no
	eq reader.pair!, [no, no]

test 'predicate method defaults preserve the receiver' do
	let reader = new PredicateDefaults
	eq reader.check!, yes
	reader.active = no
	eq reader.check!, no
	eq reader.check(yes), yes

test 'safe predicate defaults evaluate the receiver once' do
	let reader = new PredicateDefaults
	let calls = 0
	let make = do
		calls++
		reader
	eq reader.from(null), undefined
	eq reader.from(reader), yes
	eq reader.from-call(make), yes
	eq calls, 1
	eq reader.reads, 2
	eq reader.from-call(make, no), no
	eq calls, 1

test 'predicate defaults preserve super and arguments' do
	let reader = new InheritedPredicateDefaults
	eq reader.inherited!, yes
	eq reader.from-arguments(reader), yes
	eq reader.reads, 2

test 'closure defaults can read predicates' do
	let reader = new PredicateDefaults
	let read = do(value = reader.ready?) value
	eq read!, yes
	reader.active = no
	eq read!, no
	eq read(null), null
	eq reader.reads, 2

test 'super predicate method defaults call the method on self' do
	let reader = new InheritedPredicateDefaults
	eq reader.inherited-match!, yes
	reader.active = no
	eq reader.inherited-match!, no

test 'destructured predicate defaults' do
	let reader = new PredicateDefaults
	eq reader.first!, yes
	eq reader.first([no]), no
	eq reader.named!, yes
	eq reader.named(value: no), no
	eq reader.reads, 2

test 'implicit predicate reads in closure defaults' do
	let reader = new PredicateDefaults
	let read = reader.reader!
	eq read!, yes
	reader.active = no
	eq read!, no
	eq read(yes), yes
	eq reader.reads, 2
