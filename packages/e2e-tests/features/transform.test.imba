import {generateImbaCode} from '../../imba/src/vite-plugin/cucumber-plugin'
import np from 'node:path'
import nfs from 'node:fs'

def transform(path)
	path = np.resolve np.join('features', path)
	const content = await nfs.promises.readFile(path, 'utf-8')
	await generateImbaCode(path, content)

# It makes sense to write these tests manually
# if this is broken then feature tests won't run
describe "Cucumber plugin " do
	test "Add.feature" do
		const code = await transform("add.feature")
		expect(code).toMatchSnapshot!

	test "scenario-outline feature" do
		const code = await transform("scenario-outline.feature")
		expect(code).toMatchSnapshot!
