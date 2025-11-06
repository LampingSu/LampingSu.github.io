/* 本模块的目标：从链接下载，且保存为指定的文件名。 */

/* 如果网站与链接资源服务器同源，或链接资源服务器支持CORS跨域资源， 可直接在网页中使用a标签的download属性。示例如下：
<a href="文件链接" download="自定义文件名">点击下载</a>

或者，调用下面的JS函数。
<button onclick="downloadDirectly('文件链接', '自定义文件名')">下载</button>
*/
export function downloadDirectly(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/*如果网站与链接资源服务器不同源，且链接资源服务器支持不CORS跨域资源， 则要调用下面的JS函数。
<button onclick="downloadIndirect('文件链接', '自定义文件名')">下载</button>
*/
export async function downloadIndirect(url, filename) {
  try {
    // 创建进度指示器
    const progressBar = document.createElement('progress');
    progressBar.max = 100;
    document.body.appendChild(progressBar);

    // 使用可取消的流式下载
    const response = await fetch(url);
    const contentLength = +response.headers.get('Content-Length');
    const reader = response.body.getReader();

    let receivedLength = 0;
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      receivedLength += value.length;

      // 更新进度（避免频繁重绘）
      if (receivedLength % 100000 === 0) {
        const percent = (receivedLength / contentLength) * 100;
        progressBar.value = percent;
      }
    }

    // 创建Blob并触发下载
    const blob = new Blob(chunks);
    const downloadUrl = URL.createObjectURL(blob);
    downloadDirectly(downloadUrl, filename)

    // 清理资源
    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(progressBar);
    }, 100);
  } catch (error) {
    console.error("[ERROR]", error.message, error.stack);
    showModal({
      title: "下载失败",
      content: `${error.userMessage}<br><small>错误代码: ${error.code || "UNKNOWN"}</small>`,
      buttons: ["关闭"]
    });
    // 可添加重试逻辑
  }
}