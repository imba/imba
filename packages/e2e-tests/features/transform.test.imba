import {generateImbaCode} from '../../imba/src/vite-plugin/cucumber-plugin'
import np from 'node:path'

def transform(path)
	path = np.resolve np.join('features', path)
	await generateImbaCode(path)

# It makes sense to write these tests manually
# if this is broken then feature tests won't run
describe "Cucumber plugin " do
	test "Add.feature" do
		const code = await transform("add.feature")
		expect(code).toMatchSnapshot!
	test "scenario-outline feature" do
		const code = await transform("scenario-outline.feature")
		expect(code).toMatchSnapshot!
