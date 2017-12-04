import queue from 'queue'
import {sleep} from './promises'


describe('asynchronous lockable queue', () => {

  describe('auto-starting job queue', () => {
    let messages = []
    const q = queue({autostart: true, timeout: 100})
    q.on('success', (result, job) => messages.push(`finished processing:${job.toString().replace(/\n/g, '')}`))
    q.on('error', (e, job) => { messages.push(`encountered a problem with ${job.toString().replace(/\n/g, '')}`, e); throw e })
    q.on('timeout', (next, job) => { messages.push(`job timed out:, ${job.toString().replace(/\\n/g, '')}`); next() })
    q.on('end', (errors) => messages.push(`DONE :-${errors ? '(' : ')'}`))

    it('queue can accept callbacks and promises', async () => {
      messages = []
      const results = []
      q.push(() => Promise.resolve(results.push('one')))
      q.push((cb) => { results.push(2); cb() })
      q.push(() => Promise.resolve(results.push('three')))
      q.push((cb) => results.push(4)) // oops, forgot to execute callback (should time out)
      q.push((cb) => { setTimeout(() => { results.push(5); cb() }, 200) })
      q.push(() => sleep(200).then(resolve => results.push('six')))
      expect(q.length).toEqual(5) // only one callback completed successfully
      expect(results).toEqual(['one',2,'three',4])
      expect(messages).toEqual([
        'finished processing:cb => {results.push(2);cb();}',
      ])

      messages = []
      await sleep(100)
      expect(results).toEqual(['one',2,'three',4])
      expect(messages).toEqual([
        "finished processing:() => Promise.resolve(results.push('one'))",
        "finished processing:() => Promise.resolve(results.push('three'))",
        "job timed out:, cb => results.push(4)",
        "job timed out:, cb => {setTimeout(() => {results.push(5);cb();}, 200);}",
        "job timed out:, () => (0, _promises.sleep)(200).then(resolve => results.push('six'))",
        "DONE :-)",
      ])
      expect(q.length).toEqual(0)
    })
  })

  describe('manual start/stop job queue', () => {
    let messages = []
    const q = queue({concurrency: 10, timeout: 20})
    q.on('success', (result, job) => messages.push(`finished processing:${job.toString().replace(/\n/g, '')}`))
    q.on('error', (e, job) => { messages.push(`encountered a problem with ${job.toString().replace(/\n/g, '')}`, e); throw e })
    q.on('timeout', (next, job) => { messages.push(`job timed out:, ${job.toString().replace(/\\n/g, '')}`); next() })
    q.on('end', (errors) => messages.push(`DONE :-${errors ? '(' : ')'}`))

    it('queue can accept callbacks', async () => {
      messages = []
      const results = []
      q.push((cb) => { results.push(2); cb() })
      q.push((cb) => { results.push(4); cb() })
      q.push((cb) => results.push(5)) // oops, forgot to execute callback (should time out)
      q.unshift((cb) => { results.push(1); cb() })
      q.splice(2, 0, (cb) => { results.push(3); cb() })

      q.start()
      expect(q.length).toEqual(1) // one un-called callback
      expect(results).toEqual([1,2,3,4,5])
      expect(messages).toEqual([
        'finished processing:cb => {results.push(1);cb();}',
        'finished processing:cb => {results.push(2);cb();}',
        'finished processing:cb => {results.push(3);cb();}',
        'finished processing:cb => {results.push(4);cb();}',
      ])

      messages = []
      await sleep(50)
      expect(q.length).toEqual(0)
      expect(messages).toEqual([
        'job timed out:, cb => results.push(5)',
        'DONE :-)',
      ])
    })

    it('queue can accept promises', async () => {
      messages = []
      const results = []
      q.push(() => Promise.resolve(results.push('six')))
      q.push((cb) => { results.push(7); cb() })
      q.stop()
      expect(q.length).toEqual(2)

      q.push(() => Promise.resolve(results.push('eight')))
      q.push((cb) => { results.push(9); cb() })
      q.start((e) => { if (e) throw e })
      expect(q.length).toEqual(2) // two promises
      expect(messages).toEqual([
        'finished processing:cb => {results.push(7);cb();}',
        'finished processing:cb => {results.push(9);cb();}',
      ])

      messages = []
      await sleep(50)
      expect(q.length).toEqual(0)
      expect(results).toEqual(['six',7,'eight',9])
      expect(messages).toEqual([
        "finished processing:() => Promise.resolve(results.push('six'))",
        "finished processing:() => Promise.resolve(results.push('eight'))",
        'DONE :-)',
      ])
    })

    it('queue accepts timed out jobs', async () => {
      messages = []
      const results = []
      q.push((cb) => { setTimeout(() => { results.push('one'); cb() }, 50) })
      q.push(() => sleep(50).then(resolve => results.push('two')))
      q.start()
      expect(q.length).toEqual(2) // one timed out callback, one timed out promise
      expect(results).toEqual([])
      expect(messages).toEqual([])

      await sleep(100)
      expect(q.length).toEqual(0)
      expect(results).toEqual(["one", "two"])
      expect(messages).toEqual([
        "job timed out:, cb => {setTimeout(() => {results.push('one');cb();}, 50);}",
        "job timed out:, () => (0, _promises.sleep)(50).then(resolve => results.push('two'))",
        'DONE :-)',
      ])
    })

    it('queue.end() clears all jobs', () => {
      messages = []
      const results = []
      q.push((cb) => { setTimeout(() => { results.push('one'); cb() }, 50) })
      q.push(() => sleep(50).then(resolve => results.push('two')))
      q.start((e) => {
        if (e) throw e
        messages.push(`enough is enough`)
      })
      expect(q.length).toEqual(2) // one timed out callback, one timed out promise
      expect(results).toEqual([])
      expect(messages).toEqual([])

      q.end()
      expect(q.length).toEqual(0)
      expect(results).toEqual([])
      expect(messages).toEqual([
        'DONE :-)',
        'enough is enough',
      ])
    })
  })

})
