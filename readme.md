# jQloader v0.0.9

## Home
https://moerj.github.io/jQloader
  
  
## 功能
- 指令模板，html 页面直接引入其他页面
- 动态加载，ajax 动态加载html页面
- 历史记录，ajax 页面会存入浏览器历史记录
- 路由机制，ajax 加载#号后地址指向的页面
- 进度条，页面顶部自动的进度条效果

  
  
## 安装
引入依赖jQuery 或者 Zepto
```html
<script src="jquery.js"></script>
<script src="jQloader.js"></script>
```
  
  
## 指令库
  
### jq-include 引入页面
ajax 方式请求一个页面，并放入在该容器中
```html
<!-- somePage页面将会以 ajax 方式加进来 -->
<jq-include src="./somePage.html"></jq-include>
```
  
### jq-router 路由容器
整个浏览器窗口只能有一个jq-router，多余的将会被忽略。  
  
__用途：__  
呈现ajax页面的容器，用于显示地址栏#xxx.html部分的数据，如果页面上没有路由容器，则首次加载忽略路由地址。

```html
<!-- 把 loadPage 方法请求的数据塞入这里 -->
<jq-router></jq-router>
```
__提示：__  
当你需要一个页面有多个容器呈现其他 ajax 页面数据时，请使用 jq-include 指令。  
jq-router 指令仅仅是用来读取浏览器历史数据和路由页面的。  
  

### a 标签
可以直接使用 a 标签来请求一个页面，当你使用了 load 属性时，会屏蔽 herf 属性。  
a 标签的锚点功能依然保留，但点击后标签不会改变地址栏，因为#号已被路由功能占用。_to be optimized_
- load  点击后请求的url地址
- to  请求到的页面存放容器，不设置时默认存放在 jq-router 容器
```html
<!-- 将hellow页面加载到id为container的容器中 -->
<a load="./hellow.html" to="#container"></a>
```  
  
## 公共方法  
  
### loadPage 加载页面
ajax 方式加载页面到容器中
```javascript
// 在一个 div 容器中加载页面
$('div').loadPage({
    url: 'url string',  //请求地址，必须
    history: true,      //是否写入浏览器历史，默认 true
    progress: true,     //是否加载时显示进度条，默认 true
    cache: true,        //是否开启缓存，默认 true
    async: true,        //是否异步，默认 true
    title: 'string'     //浏览器tab页名称，默认 null
})
```
  
### loadFinish 加载页面后的回调
目标容器使用 loadPage 或者指令方式加载完数据后的回调
```javascript
$('div').loadFinish(function () {
    // loadPage 完成，执行的代码
})
```
  
### $.progressBar 操作进度条
顶部的进度条，页面加载时会自动执行。(注意：除非你有其他用途，通常进度条并不需要你去手动操作)
```javascript
$.progressBar
.star()             //进度条开始
.stop()             //暂停
.reset()            //重置进度条 0%
.finish()           //走完进度条 100%
.setColor('color')  //设置进度条颜色
```
  

## 其他

### 支持 ajax 载入页面的 js 运行
用过淘宝SUI Mobile的同学应该知道，他们也提供了前端静态路由功能，但是不能运行 ajxa 页面上的 js  
本框架的 jQloader 库提供这项功能。并随着版本更新，会逐渐完善。  

## TODO
- 想办法销毁上一个 ajax 页面的 js，以免出现js 重复运行的问题。
