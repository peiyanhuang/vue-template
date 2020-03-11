import axios from 'axios'

const CancelToken = axios.CancelToken

// 默认headers
axios.defaults.headers = {
  Accept: '*/*',
  'Content-Type': 'application/json; charset=utf-8'
}

const api = (opts = {}) => {
  const config = opts.config || {}

  return axios.request({
    url: opts.url,
    method: opts.method || 'post',
    headers: opts.headers || {},
    data: opts.data || {},
    ...config
  })
}

// 防止接口重复调用
const avoidMultipleInvoking = function (fn) {
  const invokingStack = new Map()

  return function () {
    const { cancelToken, url } = arguments[0]
    const source = CancelToken.source()
    const ajaxFlag = JSON.stringify(arguments)

    if (!cancelToken) {
      if (invokingStack.has(ajaxFlag)) {
        console.warn('cancel: %s 重复调用', url)
        invokingStack.get(ajaxFlag).cancel()
      }
      invokingStack.set(ajaxFlag, source)
    }

    return fn.call(this, {
      cancelToken: source.token,
      ...arguments[0]
    }).finally(() => {
      invokingStack.delete(ajaxFlag)
    })
  }
}

export { api as $fetch }

export default {
  install: Vue => {
    Vue.prototype.$fetch = avoidMultipleInvoking(api)
  }
}
