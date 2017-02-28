# jQloader v0.2.4
一款精简而丰富的微型框架，非常适合以 jQuery 为核心的项目使用。  
它的核心功能为 ajax + pushState 实现异步加载、路由、浏览器历史。并集成指令模板、进度条、loading效果等功能。


## Home
https://moerj.github.io/jQloader
  
  
## Features
- 指令模板，html 页面直接引入其他页面
- 动态加载，ajax 动态加载html页面
- 历史记录，ajax 页面会存入浏览器历史记录
- 路由机制，路由地址以#号连接在浏览器地址栏
- 自动载入效果，包括：进度条、蒙层等方式

  
  
## Install
```cmd
npm i jqloader
```

引入依赖 jQuery 或者 Zepto
```html
<script src="jquery.js"></script>
<script src="jQloader.js"></script>
```
  
  
## HTML-Order
  
### jq-include
引入页面  
ajax 方式请求一个页面，并放入在该容器中
```html
<!-- somePage页面将会以 ajax 方式加进来 -->
<jq-include src="./somePage.html"></jq-include>
```
  
### jq-router
路由容器  
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
  

### a
可以直接使用 a 标签来请求一个页面，当你使用了 load 属性时，会屏蔽 herf 属性。  
a 标签的锚点功能依然保留，但点击后标签不会改变地址栏，因为#号已被路由功能占用。_to be optimized_  

私有属性：
- __load__  点击后请求的url地址
- __to__  请求到的页面存放容器，不设置时默认存放在 jq-router 容器

```html
<!-- 将hellow页面加载到id为container的容器中，页面名称显示为hellow jQloader -->
<a load="./hellow.html" to="#container" title="hellow jQloader"></a>
```  

支持所有 [Options](#Options) 参数，属性参数可以为空，例如：
```html
<a strict loading></a>
<!--等价于-->
<a strict="true" loading="true"></a>

<a></a>
<!--等价于-->
<a strict="false" loading="false"></a>
```

## Options

### history
写入浏览器历史，默认 true

### progress
加载时显示进度条，默认 true

### loading
显示加载提示，并锁定界面，默认 false

### cache
ajax开启缓存，默认 true

### async
ajax请求异步，默认 true

### title
请求数据后，改变浏览器tab页名称，默认 null

### strict
严格模式加载 ajxa，默认 false  
使用严格模式进行 ajxa 请求，此时请求会完全重载整个页面，防止重复js运行。  
虽然支持 ajax 载入页面的 js 运行，但是由于安全限制以及可能出现的 js 重复运行的问题，建议将所有 js 写在主页面，事件以委托方式绑定。  
若你还是想在 ajax 页面中写 js， 有2种办法确保安全：  
- 请确保这部分 js 没有对主页面和全局对象有事件绑定，不然很可能再次打开此页面时会重复绑定事件。  
- 使用 strict 模式请求页面，这样可以保证是完全重载。

  
## API

### loadPage
加载页面  
ajax 方式加载页面到容器中
```javascript
// 在一个 div 容器中加载页面
$('div').loadPage({
    url: 'url string',  //请求地址，必须
    history: true,      //写入浏览器历史，默认 true
    progress: true,     //加载时显示进度条，默认 true
    loading: false,     //显示加载提示，并锁定界面，默认 false
    cache: true,        //开启缓存，默认 true
    async: true,        //异步，默认 true
    title: 'string',    //浏览器tab页名称，默认 null
    strict: false       //严格模式加载 ajxa，默认 false
},function(){
    // callBack
})
```
  
### loadFinish
加载页面后的回调  
目标容器使用 loadPage 或者指令方式加载完数据后的回调
```javascript
$('div').loadFinish(function () {
    // loadPage 完成，执行的代码
})
```
  
### progressBar
加载进度条  
loading 状态时顶部的进度条，页面加载时会自动执行。(注意：除非你有其他用途，通常进度条并不需要你去手动操作)
```javascript
$.progressBar
.star()             //进度条开始
.stop()             //暂停
.reset()            //重置进度条 0%
.finish()           //走完进度条 100%
.setColor('color')  //设置进度条颜色
```

### loadingMask
手动开启一个 loading 效果并锁定界面。  
支持 FontAwesome 图标库，当引入后会有加载特效。
```javascript
$.loadingMask
.show()
.hide()
```  
