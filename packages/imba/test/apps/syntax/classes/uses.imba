import {LocalClass} from './definitions.imba'
import './extensions.imba'

test "global class is declared" do
	let instance = new GlobalClass
	eq GlobalClass.name, 'GlobalClass'
	eq instance.dfn, 1
	eq instance.ext, 1

test "local class is declared" do
	let instance = new LocalClass
	eq LocalClass.name, 'LocalClass'
	eq instance.dfn, 2
	eq instance.ext, 2

	

test "namespaced global classes 1" do
	let instance = new GlobalClass.Member
	eq GlobalClass.Member.dfn,3
	eq GlobalClass.Member.name, 'Member'
	eq instance.dfn, 3
	eq instance.ext, 3

	
	eq GlobalClass.Sub.dfn ,4
	eq GlobalClass.Sub.name, 'Sub'

	let sub = new GlobalClass.Sub
	eq sub.dfn, 4

test "namespaced global classes" do
	let instance = new GlobalClass.ExtMember
	eq instance.dfn, 4
	eq GlobalClass.ExtMember.name, 'ExtMember'

test "namespaced classes" do
	let instance = new LocalClass.ExtMember
	eq instance.dfn, 5
	eq LocalClass.ExtMember.name, 'ExtMember'

	let mem = new LocalClass.Member
	eq LocalClass.Member.name, 'Member'
	eq mem.dfn, 2
	eq mem.ext, 2