/* 本模块的目标：从链接下载，且保存为指定的文件名。 */

/* 如果网站与链接资源服务器同源，或链接资源服务器支持CORS跨域资源， 可直接在网页中使用a标签的download属性。示例如下：
<a href="文件链接" download="自定义文件名">点击下载</a>

或者，调用下面的JS函数。
<button onclick="downloadDirectly('文件链接', '自定义文件名')">下载</button>
*/
function downloadDirectly(url, filename) {
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
async function downloadIndirect(url, filename) {
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



// 下载处理函数 - 支持中文文件名
function handleDownloadWithChineseName(downloadUrl, chineseFilename) {
  console.log(`handleDownloadWithChineseName(${downloadUrl}, ${chineseFilename}) starts.`)
  // 方法1: 使用 Fetch API 下载并重命名
  fetch(downloadUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('网络响应错误');
      }
      return response.blob();
    })
    .then(blob => {
      // 创建 blob URL
      const blobUrl = URL.createObjectURL(blob);
      console.log(`blobUrl：${blobUrl}`)
      // 创建隐藏的下载链接
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = chineseFilename;
      link.style.display = 'none';

      // 添加到文档并触发下载
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    })
    .catch(error => {
      console.error('下载失败:', error);
      // 降级方案: 新窗口打开并提示用户手动重命名
      fallbackDownload(downloadUrl, chineseFilename);
    });
  console.log(`handleDownloadWithChineseName(${downloadUrl}, ${chineseFilename}) ended.`)
}

// 降级下载方案
function fallbackDownload(downloadUrl, chineseFilename) {
  console.log(`fallbackDownload(${downloadUrl}, ${chineseFilename}) starts.`)
  const newWindow = window.open(downloadUrl, '_blank');

  // 显示提示信息
  setTimeout(() => {
    if (newWindow && !newWindow.closed) {
      const userConfirmed = confirm(
        `下载提示:\n\n` +
        `请在新打开的窗口中使用"另存为"功能\n` +
        `并将文件名改为:\n"${chineseFilename}"\n\n` +
        `点击"确定"查看下载提示页面。`
      );

      if (userConfirmed) {
        // 可以打开一个帮助页面或者显示更详细的说明
        showDownloadHelp(chineseFilename);
      }
    }
  }, 1000);
  console.log(`fallbackDownload(${downloadUrl}, ${chineseFilename}) ended.`)
}

// 显示下载帮助
function showDownloadHelp(filename) {
  console.log(`showDownloadHelp(${filename}) starts.`)
  const helpHtml = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h3>下载说明</h3>
            <p><strong>请按以下步骤操作：</strong></p>
            <ol>
                <li>在新打开的下载页面中，右键点击播放器或下载链接</li>
                <li>选择"另存为..."或"Save as..."</li>
                <li>将文件名改为: <code>${filename}</code></li>
                <li>选择保存位置并确认</li>
            </ol>
            <p><em>注意: 直接点击下载可能会使用默认的英文文件名</em></p>
            <button onclick="this.parentElement.style.display='none'" 
                    style="padding: 5px 10px; margin-top: 10px;">
                关闭
            </button>
        </div>
    `;

  const helpDiv = document.createElement('div');
  helpDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #333;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;
  helpDiv.innerHTML = helpHtml;
  document.body.appendChild(helpDiv);
  console.log(`showDownloadHelp(${filename}) ended.`)
}

// 导出函数供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { handleDownloadWithChineseName, fallbackDownload, downloadDirectly, downloadIndirect };
}