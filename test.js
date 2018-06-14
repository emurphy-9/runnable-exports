import test from 'ava'
import execa from 'execa'

test('throw with no exported func calling only the file', async t => {
	const error = await t.throws(execa('node', ['./testfiles/noexport.spec.js']))
	const msg = `Error: RUNNABLE-EXPORTS: can't run your command: `;
	const suggestion = `Module doesn't export any functions`;
  t.true(error.stderr.includes(msg));
  t.true(error.stderr.includes(suggestion));
})

test('throw with default exported func calling with double type args', async t => {
	const error = await t.throws(execa('node', ['./testfiles/defaultexport.spec.js', 'asd', '--asd']))
	const msg = `Error: RUNNABLE-EXPORTS: can't run with both objectArgs and arrayArgs: {\"asd\":true}, asd`
  t.true(error.stderr.includes(msg))
})

test('throw with exported func calling with a wrong name', async t => {
	const error = await t.throws(execa('node', ['./testfiles/export.spec.js', 'asd']))
	const msg = `Error: RUNNABLE-EXPORTS: can't run your command: asd`;
	const suggestion = `Perhaps you meant: test`;
  t.true(error.stderr.includes(msg));
  t.true(error.stderr.includes(suggestion));
})

test('throw with exported func calling with double type args', async t => {
	const error = await t.throws(execa('node', ['./testfiles/export.spec.js', 'test', 'asdasd', '--asd']))
	const msg = `Error: RUNNABLE-EXPORTS: can't run with both objectArgs and arrayArgs: {\"asd\":true}, asdasd`
  t.true(error.stderr.includes(msg))
})

test('throw with func calling wrong name suggests valid function names', async t => {
	const error = await t.throws(execa('node', ['./testfiles/multiple-exports.spec.js', 'noFunction']));
	const message = `Error: RUNNABLE-EXPORTS: can't run your command: noFunction`;
	const suggestions = `Perhaps you meant one of the following: testFunction, otherFunction`;
	t.true(error.stderr.includes(message));
	t.true(error.stderr.includes(suggestions));
})

test('work with default export (no-args)', async t => {
	const stdout = (await execa('node', ['./testfiles/defaultexport.spec.js'])).stdout
	t.is(stdout, '[]')
})

test('work with default export (normal args)', async t => {
	const stdout = (await execa('node', ['./testfiles/defaultexport.spec.js', 'test'])).stdout
	t.is(stdout, `[ 'test' ]`)
})

test('work with default export (object args)', async t => {
	const stdout = (await execa('node', ['./testfiles/defaultexport.spec.js', '--test'])).stdout
	t.is(stdout, '{ test: true }')
})

test('work with func export (no-args)', async t => {
	const stdout = (await execa('node', ['./testfiles/export.spec.js', 'test'])).stdout
	t.is(stdout, '[]')
})

test('work with func export (normal args)', async t => {
	const stdout = (await execa('node', ['./testfiles/export.spec.js', 'test', 'asd'])).stdout
	t.is(stdout, `[ 'asd' ]`)
})

test('work with func export (object args)', async t => {
	const stdout = (await execa('node', ['./testfiles/export.spec.js', 'test', '--asd'])).stdout
	t.is(stdout, '{ asd: true }')
})

test('nested runnable-exports', async t => {
	const stdout = (await execa('node', ['./testfiles/nested.spec.js', 'test', '--asd'])).stdout
	t.is(stdout, 'cache deleted')
})

test('Function args are not passed as an array', async t => {
	const functionName = 'otherFunction';
	const functionArgs = ['foo', 'bar', 'baz'];
	const stdout = (await execa('node', ['./testfiles/multiple-exports.spec.js', 'otherFunction', ...functionArgs]))

	t.is(stdout, 'Inserting bar at index foo with type baz');
});


test('Function args can be combined into array', async t => {
	const stdout = (await execa('node', ['./testfiles/multiple-exports.spec.js', 'testFunction', 'arg1', 'arg2', 'arg3', 'arg4']));
	t.is(stdout, '4 arguments entered');
});

test('Function can count array of 0 args', async t => {
	const stdout = (await execa('node', ['./testfiles/multiple-exports.spec.js', 'testFunction']));
	t.is(stdout, '0 arguments entered');
});

test('Funnction can count array with 1 arg', async t => {
	const stdout = (await execa('node', ['./testfiles/multiple-exports.spec.js', 'testFunction', 'arg']));
	t.is(stdout, '1 arguments entered');
});
