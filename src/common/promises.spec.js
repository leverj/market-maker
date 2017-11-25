import {sleep, withTimeout} from './promises'


describe('promises', () => {
  describe('sleep', () => {
    it('fastest timeout wins', async () => {
      const first = sleep(400).then(resolve => 1)
      const second = sleep(200).then(resolve => 2)
      const third = sleep(300).then(resolve => 3)
      expect(await Promise.race([first, second, third])).toBe(2)
    })
  })

  describe('withTimeout', () => {
    it('should timeout if not given enough time', async () => {
      let result = "before"
      const doIt = () => sleep(20).then(resolve => "after")

      await withTimeout(10, doIt(), 'to be, or not to be ...').
        then(resolve => fail('we should have timed out')).
        catch(reject => {
          expect(reject).toMatch(/10/)
          expect(reject).toEqual('[to be, or not to be ...] timed out after 10 millis')
        })
      expect(result).toEqual("before")

      await withTimeout(30, doIt()).
        then(resolve => result = resolve).
        catch(reject => fail('we should have NOT timed out'))
      expect(result).toEqual("after")
    })

    it('should accomplish mission without waiting', async () => {
      let result = "before"
      const doIt = () => sleep(10).then(resolve => "after")
      withTimeout(30, doIt()).
        then(resolve => result = resolve).
        catch(reject => fail('we should have NOT timed out'))
      expect(result).toEqual("before")

      // now give it time ..
      await sleep(20)
      expect(result).toEqual("after")
    })
  })

})
