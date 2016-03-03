extern describe, test, ok, eq, it

def chk str,fn
	var stripped = fn.toString.replace(/^function\s?\(\)\s?\{\s*(return )?/,'').replace(/\;?\s*\}\s*$/,'')
	eq stripped, str

describe "Formatting" do

	# some basic tests to make sure we dont add nested parens all over the place
	test "test" do
		chk "!!true" do !!true
		chk "1 + 2" do 1 + 2