/* 本模块的目标：从指定的URL下载，且保存为指定的文件名。 */

/* 如果网站与链接资源服务器同源，或链接资源服务器支持CORS跨域资源，可直接在网页中使用a标签的download属性。示例如下：
<a href="文件链接" download="自定义文件名">点击下载</a>
或者，调用下面的JS函数。
<button onclick="downloadDirectly('文件链接', '自定义文件名')">点击下载</button>
注意： 网站与链接资源服务器不同源，且链接资源服务器不支持CORS跨域资源时，下载后的文件名是链接资源的原始文件名。
*/
function downloadDirectly(url, fileName) {
  console.log(`downloadDirectly(${url}, ${fileName}) starts.`);
  const link = document.createElement('a');
  link.style.display = 'none'
  link.rel = 'noopener'
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  console.log(`downloadDirectly(${url}, ${fileName}) ended.`);
}


/*如果网站与链接资源服务器不同源，且链接资源服务器支持不CORS跨域资源， 可调用下面的JS函数，实现下载为指定的文件名。
<button onclick="downloadViaWorker('文件链接', '自定义文件名')">点击下载</button>
*/
/**
 * 在当前页面下载（创建隐藏 <a> 并点击）
 * - 不离开页面
 * - 依赖 Worker 返回 Content-Disposition 来指定文件名（中文）
 * - 无法在 JS 中获知下载是否成功（浏览器负责保存）
 */
function downloadViaWorker(url, fileName) {
  const proxied = proxiedUrl(url, fileName, workerBase)

  const a = document.createElement('a')
  a.href = proxied
  // 不设置 download 属性，依赖服务器返回的 Content-Disposition；
  // 若设置 download 且是跨域，可能被忽略。
  a.style.display = 'none'
  a.rel = 'noopener'
  // 将元素加入 DOM，触发点击，然后移除
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * 先用 HEAD（或 GET 如果 HEAD 不被允许）做一次可用性检查，再触发下载。
 * - 能在失败时把错误暴露给前端（例如弹窗、日志、fallback）
 * - 返回 Promise，resolve 表示已触发下载，reject 表示检查失败或异常
 */
function downloadViaWorkerWithCheck(url, fileName, opts = {}) {
  const proxied = proxiedUrl(url, fileName, workerBase)
  const timeoutMs = opts.timeoutMs || 10000
  const method = opts.method || 'HEAD' // 若上游不支持 HEAD 可改为 'GET'

  // 超时包装
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('检查超时')), timeoutMs)
  })

  const fetchPromise = fetch(proxied, { method: method, mode: 'cors' })

  return Promise.race([fetchPromise, timeoutPromise])
    .then(resp => {
      if (!resp.ok) {
        throw new Error('资源不可用，http status: ' + resp.status)
      }
      // 检查通过，触发下载
      downloadViaWorker(url, fileName, workerBase)
      return true
    })
    .catch(err => {
      // 将错误抛出或在这里统一处理（比如 alert）
      // 这里不做 UI 处理，仅 rethrow，调用者可自行处理
      throw err
    })
}

function proxiedUrl(assetUrl, fileName, workerBase = DEFAULT_WORKER_BASE) {
  const DEFAULT_WORKER_BASE = 'https://nm.sulpplus.workers.dev/_proxy'
  return workerBase + '?url=' + encodeURIComponent(assetUrl) + '&name=' + encodeURIComponent(fileName)
}

// 导出函数供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { downloadDirectly, downloadViaWorker, downloadViaWorkerWithCheck };
}