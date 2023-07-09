import { describe, expect, it } from 'vitest'
import { makeFetch } from 'supertest-fetch'
import { app } from '../server'
describe('/search tests', () => {
  describe('test for input', () => {
    it('throw error if query is not present', async () => {
      expect.assertions(1)
      await makeFetch(app)('/search', { method: 'POST' })
        .expectStatus(400)
        .then(async (res) => await res.json())
        .then((res) => {
          expect(res.error.message).toEqual('Query is required')
        })
    })
    it('throw error if query is html', async () => {
      expect.assertions(1)
      await makeFetch(app)(
        '/search?' +
          new URLSearchParams({
            query: '<html></html>'
          }),
        { method: 'POST' }
      )
        .expectStatus(400)
        .then(async (res) => await res.json())
        .then((res) => {
          expect(res.error.message).toEqual('Query must be a string and not html code')
        })
    })
    it('throw error if query is longer than 100 chars', async () => {
      expect.assertions(1)
      await makeFetch(app)(
        '/search?' +
          new URLSearchParams({
            query: new Array(110).fill(5).join('')
          }),
        { method: 'POST' }
      )
        .expectStatus(400)
        .then(async (res) => await res.json())
        .then((res) => {
          expect(res.error.message).toEqual('Query length must be less than 100 characters')
        })
    })
    it('throw error if start si not number string', async () => {
      expect.assertions(1)
      await makeFetch(app)(
        '/search?' +
          new URLSearchParams({
            query: 'hello',
            start: 'hello'
          }),
        { method: 'POST' }
      )
        .expectStatus(400)
        .then(async (res) => await res.json())
        .then((res) => {
          expect(res.error.message).toEqual('start should be a number string')
        })
    })
    it('throw error if start is less than 0', async () => {
      expect.assertions(1)
      await makeFetch(app)(
        '/search?' +
          new URLSearchParams({
            query: 'hello',
            start: '-1'
          }),
        { method: 'POST' }
      )
        .expectStatus(400)
        .then(async (res) => await res.json())
        .then((res) => {
          expect(res.error.message).toEqual('start should be between 1 and 99')
        })
    })
    it('throw error if start is larger than 100', async () => {
      expect.assertions(1)
      await makeFetch(app)(
        '/search?' +
          new URLSearchParams({
            query: 'hello',
            start: '10000000'
          }),
        { method: 'POST' }
      )
        .expectStatus(400)
        .then(async (res) => await res.json())
        .then((res) => {
          expect(res.error.message).toEqual('start should be between 1 and 99')
        })
    })
    it('throw error if query is absent but start is present', async () => {
      expect.assertions(1)
      await makeFetch(app)(
        '/search?' +
          new URLSearchParams({
            start: '6'
          }),
        { method: 'POST' }
      )
        .expectStatus(400)
        .then(async (res) => await res.json())
        .then((res) => {
          expect(res.error.message).toEqual('Query is required')
        })
    })
  })
})
