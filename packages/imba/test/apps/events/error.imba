###
Call it exception instead?
If a promise rejects instead of throwing - should we emit rejection instead?
###

import 'imba/spec'

class AppError < Error

tag app-root

	def edit-item
		throw new AppError("not allowed to edit")

	def buggy-handler
		Math.rendom!

	def reject-promise
		new Promise do(resolve,reject)
			reject(1000)

	def throw-promise
		new Promise do(resolve,reject)
			throw "Something went wrong"

	def handle-error e
		console.info "AppError",e.error,e.detail

	def render
		<self
			@error(AppError).trap=handle-error
			@error.trap=console.info('Error')
			# @error.trap=console.info('Error',e.error,e.detail)
		>
			<header>
				<button.edit @click=edit-item> "Edit"
				<button.call @click=buggy-handler> "Call"
				<button.reject @click=reject-promise> "Reject"
				<button.throw @click=throw-promise> "Throw"

# global.onerror = do(e)

imba.mount <app-root>

describe "@error" do

	test('specific error type') do
		await spec.click("button.edit")
		eq $1.log, ['AppError']

	test('regular error') do
		await spec.click("button.call")
		eq $1.log, ['Error']
