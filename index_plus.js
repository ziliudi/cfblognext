import { env } from "cloudflare:workers";

/**------【①.谋而后定：配置区】-----**/

'use strict';
const CFBLOG = env.CFBLOG;

const ACCOUNT = { //账号相关，安全性更高

  // 部署前必须设置为仅自己知道的强凭据；留空或保留占位值时后台认证会拒绝所有请求。
  "third_token" : "", //可选的只读导出 Token；不使用时保持为空
  "cacheZoneId":"935xxxxxxxxxxxx",//区域 ID
  "cacheToken":"AQxxxxxxxx",//API token

  "kv_var": env.CFBLOG,//Workers KV 绑定
}

const OPT = { //网站配置

  /*--前台参数--*/
  "siteDomain" : "域名",// 域名(不带https 也不带/)
  "siteName" : "CFBLOG-Plus",//博客名称
  "siteDescription":"记录日常生活、阅读与思考，也分享一些折腾技术的过程。希望这些文字能留下时间的痕迹。",//博客简介（SEO描述）
  "siteIntro":"记录日常生活、阅读与思考，也分享一些折腾技术的过程。希望这些文字能留下时间的痕迹。",//首页自我介绍
  "keyWords":"cloudflare,KV,workers,blog",//关键字
  "logo":"https://cdn.jsdelivr.net/gh/Arronlong/cfblog-plus@master/themes/JustNews/files/logo2.png",//JustNews主题的logo

  "theme_github_path":"https://cdn.jsdelivr.net/gh/Arronlong/cfblog-plus@master/themes/",//主题路径
  "themeURL" : "https://raw.githubusercontent.com/Arronlong/cfblog-plus/master/themes/JustNews/", // 模板地址,以 "/"" 结尾
  //"search_xml_url":"", //search.xml外部链接，可通过github的action自动生成，不设置则实时生成
  //"sitemap_xml_url":"", //sitemap.xml外部链接，可通过github的action自动生成，不设置则实时生成
  
  "pageSize" : 5,//每页文章数
  "recentlySize" : 6,//最近文章数
  "recentlyType" : 1,//最近文章类型：1-按创建时间倒序（按id倒序），2-按修改时间排序
  "readMoreLength":150,//阅读更多截取长度
  "cacheTime" : 60*60*24*2, //文章在浏览器的缓存时长(秒),建议=文章更新频率
  "html404" : `<b>404</b>`,//404页面代码
  "codeBeforHead":`
  <script src="https://cdn.staticfile.org/jquery/2.2.4/jquery.min.js"></script>
  `,//其他代码,显示在</head>前
  "codeBeforBody":`
  `,//其他代码,显示在</body>前
  "commentCode":`
  <script>
    //文章浏览页 添加编辑直达功能
    $(".entry-info").append('<a style="float:right;margin-left:5px;" href="'+location.href.replace('/article/','/admin/edit/')+'" target="_blank">编辑</a>')
  </script>
  `,//评论区代码
  "widgetOther":`
  `,//20201224新增参数,用于右侧 小部件扩展
  "otherCodeA":`热度`,//模板开发用的其他自定义变量
  "otherCodeB":``,//
  "otherCodeC":``,//
  "otherCodeD":``,//
  "otherCodeE":``,//
  "copyRight" :`© ${new Date().getFullYear()} CFBlog-Plus · Powered by <a href="https://www.cloudflare.com/">Cloudflare</a>`,//自定义版权信息
  "robots":`User-agent: *
Disallow: /admin`,//robots.txt设置
  
  /*--前后台共用参数--*/
  
  "top_flag":`<topflag>[置顶]</topflag>`,//置顶标志
  "top_flag_style":`<style>topflag {color:#ff5722}</style>`,//置顶标志的样式


  /*--后台参数--*/

  "hidden_flag":`<hiddenflag>[隐藏]</hiddenflag>`,//隐藏标志
  "hidden_flag_style":`<style>hiddenflag {color:#000000;background-color: #ffff00;}</style>`,//隐藏标志的样式
  
  "admin_home_idx": 1, //后台首页tab索引设置：1-我的文章,2-新建,3-设置,4-发布
  "editor_page_scripts": `
    //置顶设置
    let top_setting=\`
      <div class="form-group">
      <label for="exampleInputEmail2">是否置顶</label>
      <input type="hidden" class="form-control" id="top_timestamp" name="top_timestamp">
      <select class="form-control" id="istop" name="istop">
        <option value="0" selected >否</option>
        <option value="1" >是</option>
      </select>
      </div>\`
    $('form#addNewForm div.form-group,form#editForm div.form-group').last().after(top_setting);//新建和编辑页面添加置顶设置
    $("#istop").change(function(){
      $("#top_timestamp").val($(this).val()*1?new Date().getTime():0);
    });
    if(location.pathname.startsWith('/admin/edit')){//修改文章页面，自动设置置顶
      $("#istop").val(articleJson.top_timestamp?1:0);
      $("#top_timestamp").val(articleJson.top_timestamp?articleJson.top_timestamp:0);
    }
    $("#istop").trigger('change')
    //隐藏设置
    let hidden_setting=\`
      <div class="form-group">
      <label for="exampleInputEmail2">是否隐藏</label>
      <select class="form-control" id="hidden" name="hidden">
        <option value="0" selected >否</option>
        <option value="1" >是</option>
      </select>
      </div>\`
    $('form#addNewForm div.form-group,form#editForm div.form-group').last().after(hidden_setting);//新建和编辑页面添加隐藏设置
    if(location.pathname.startsWith('/admin/edit')){//修改文章页面，自动设置隐藏
      $("#hidden").val(articleJson.hidden?1:0);
    }
    let sitemapxml=\`<a  tabindex="0"  role="button"  type="submit" id="btn_export" class="btn btn-default"  href="/admin/sitemap.xml" >导出sitemap.xml</a>\`
    $('form#importForm a').last().after(sitemapxml);//设置页面添加导出sitemap.xml导出按钮
    let searchxml=\`<a  tabindex="0"  role="button"  type="submit" id="btn_export" class="btn btn-default"  href="/admin/search.xml" >导出search.xml</a>\`
    $('form#importForm a').last().after(searchxml);//设置页面添加导出search.xml导出按钮
    
    // 已切换到 TinyMCE 可视化编辑器，不再调用 Editor.md API。
    window.mdEditor = null;

    //文章工作流：草稿 / 立即发布 / 定时发布
    (function(){
      const form=document.querySelector("form#addNewForm, form#editForm");
      if(!form) return;
      const article=(typeof articleJson!=="undefined" && articleJson) || window.articleJson || {};
      const workflow=document.createElement("div");
      workflow.className="form-group";
      workflow.innerHTML='<label for="cfblog-status">文章状态</label><select class="form-control" id="cfblog-status" name="status"><option value="published">立即发布</option><option value="draft">保存为草稿</option><option value="scheduled">定时发布</option></select><div id="cfblog-schedule-wrap" style="margin-top:10px;display:none"><label for="cfblog-scheduled-at">计划发布时间</label><input class="form-control" type="datetime-local" id="cfblog-scheduled-at"><input type="hidden" name="scheduledAt" id="cfblog-scheduledAt-iso"><small class="help-block">按你浏览器所在时区选择，保存时自动转换为 UTC。</small></div>';
      const last=form.querySelector(".form-group:last-of-type");
      if(last) last.after(workflow); else form.appendChild(workflow);
      const status=workflow.querySelector("#cfblog-status");
      const date=workflow.querySelector("#cfblog-scheduled-at");
      const iso=workflow.querySelector("#cfblog-scheduledAt-iso");
      status.value=["draft","scheduled"].includes(article.status)?article.status:"published";
      if(article.scheduledAt){
        const parsed=new Date(article.scheduledAt);
        if(!isNaN(parsed.getTime())){
          const local=new Date(parsed.getTime()-parsed.getTimezoneOffset()*60000);
          date.value=local.toISOString().slice(0,16);
        }
      }
      const update=function(){
        workflow.querySelector("#cfblog-schedule-wrap").style.display=status.value==="scheduled"?"block":"none";
        iso.value=date.value?new Date(date.value).toISOString():"";
      };
      status.addEventListener("change",update);
      date.addEventListener("change",update);
      form.addEventListener("submit",update,true);
      update();
    })();

    //默认图片，工具：https://tool.lu/imageholder/
    if($('#img').val()=="")$('#img').val('https://cdn.jsdelivr.net/gh/Arronlong/cdn@master/cfblog/cfblog-plus.png');
    //默认时间设置为当前时间
    if($('#createDate').val()=="")$('#createDate').val(new Date(new Date().getTime()+8*60*60*1000).toJSON().substr(0,16));
    `, //后台编辑页面脚本

};

//---对部分配置进行处理---
{
  //CFBLOG 通用变量
  // KV namespace is read from the Worker's CFBLOG binding above.
  
  //默认为非私密博客
  if(null==OPT.privateBlog){
    OPT.privateBlog=false;
  }
  //处理themeURL、theme_github_path参数设定
  if(OPT.themeURL.substr(-1)!='/'){
    OPT.themeURL=OPT.themeURL+'/';
  }
  if(OPT.theme_github_path.substr(-1)!='/'){
    OPT.theme_github_path=OPT.theme_github_path+'/';
  }
  //置顶样式对于前台来说，与codeBeforHead结合即可
  if(OPT.top_flag_style){
  OPT.codeBeforHead += OPT.top_flag_style
  }
}

/**------【②.猎杀时刻：请求处理入口】-----**/

// Module Worker 入口：网页请求与 Cron 定时任务共用同一 Worker。
export default {
  fetch(request, env, ctx) {
    return handlerRequest({ request, env });
  },
  scheduled(controller, env, ctx) {
    ctx.waitUntil(publishScheduledArticles());
  }
};

//将到期的定时文章转为已发布，并刷新文章索引及 CDN 缓存。
async function publishScheduledArticles(){
  const all=await getAllArticlesList(), now=Date.now();
  let changed=false;
  for(const item of all){
    if(item.status!=="scheduled") continue;
    const due=Date.parse(String(item.scheduledAt||"").replace(" ","T"));
    if(!Number.isFinite(due)||due>now) continue;
    const article=await getArticle(item.id);
    if(!article) continue;
    article.status="published";
    article.publishedAt=new Date(now).toISOString();
    await saveArticle(item.id,JSON.stringify(article));
    item.status="published";
    item.publishedAt=article.publishedAt;
    changed=true;
  }
  if(changed){
    await saveArticlesList(JSON.stringify(all));
    const tags=[...new Set(all.filter(a=>a.status==="published"&&!a.hidden).flatMap(a=>Array.isArray(a.tags)?a.tags:[]).filter(Boolean))];
    await saveWidgetTags(JSON.stringify(tags));
    await purge();
  }
  return changed;
}

// 处理请求
async function handlerRequest(event){
  let request = event.request
  //获取url请求对象
  let url=new URL(request.url)
  let paths=url.pathname.trim("/").split("/")

  // 后台与私密博客统一认证。不要将凭据写入日志或错误响应。
  if(("admin"==paths[0]||true===OPT.privateBlog) &&!parseBasicAuth(request, event.env)){
    return withSecurityHeaders(new Response("Unauthorized",{
      headers:{"WWW-Authenticate":'Basic realm="cfblog"'},
      status:401
    }));
  }

  // 后台路由采用明确的 HTTP 方法白名单，避免通过 GET 链接/图片触发写操作。
  if(paths[0]==="admin"){
    const method=request.method.toUpperCase();
    const action=paths[1]||"";
    const readOnly=["","list","getList","edit","getDrafts","getScheduled","export","search.xml","sitemap.xml"];
    const writeOnly=["publish","saveConfig","import","saveAddNew","delete","saveEdit","manage"];
    if((readOnly.includes(action) && !["GET","HEAD"].includes(method)) ||
       (writeOnly.includes(action) && method!=="POST") ||
       (!readOnly.includes(action) && !writeOnly.includes(action))){
      return withSecurityHeaders(new Response("Method Not Allowed",{
        headers:{"Content-Type":"text/plain;charset=UTF-8","Allow":readOnly.includes(action)?"GET, HEAD":writeOnly.includes(action)?"POST":"GET"},
        status:405
      }));
    }
    // 拒绝明显超出正常范围的后台请求体，避免意外的大请求消耗 Worker 内存。
    const contentLength=Number(request.headers.get("Content-Length")||0);
    if(method==="POST" && contentLength>2200000){
      return withSecurityHeaders(new Response("Payload Too Large",{
        headers:{"Content-Type":"text/plain;charset=UTF-8"},
        status:413
      }));
    }
  }

  // 后台写请求必须来自本站 Origin，或由浏览器明确标记为 same-origin。
  // 不接受来源信息缺失的可疑请求；自动化客户端可显式设置本站 Origin。
  if(paths[0]==="admin" && request.method.toUpperCase()==="POST"){
    const origin=request.headers.get("Origin");
    const fetchSite=request.headers.get("Sec-Fetch-Site");
    if((origin && origin!==url.origin) ||
       fetchSite==="cross-site" ||
       (!origin && fetchSite!=="same-origin")){
      return withSecurityHeaders(new Response("Forbidden",{
        headers:{"Content-Type":"text/plain;charset=UTF-8"},
        status:403
      }));
    }
  }

  // 应用后台保存的博客资料设置；KV 中不存在时沿用代码默认值。
  await applySavedBlogSettings();

  //组装缓存请求：保留查询参数，避免主题预览/分页参数互相污染缓存
  const D=caches.default,
      cacheable = request.method === "GET" && paths[0] !== "admin",
      cacheVersion = cacheable ? (await CFBLOG.get("SYSTEM_PUBLIC_CACHE_VERSION") || "1") : "",
      // 文章索引更新时递增版本号，避免依赖可选的 Zone API Token 才能让新内容即时生效。
      M="https://"+OPT.siteDomain+url.pathname+url.search+(url.search?"&":"?")+"__cfblogv="+encodeURIComponent(cacheVersion),
      x = cacheable ? new Request(M, { method: "GET" }) : null;
  let k = cacheable ? await D.match(x) : null;
  if(k){
    return withSecurityHeaders(k);
  }

  switch(paths[0]){
    case "favicon.ico": //图标
      k = await handle_favicon(request);
      break;
    case "robots.txt":
      k = await handle_robots(request);
      break;
    case "sitemap.xml":
      k = await handle_sitemap(request);
      break;
    case "search.xml":
      k = await handle_search(request);
      break;
    case "admin": //后台
      k = await handle_admin(request);
      break;
    case "article": //文章内容页
      k = await handle_article(paths[1]);
      break;
    case "": //文章 首页
    case "page": //文章 分页
    case "category": //分类 分页
    case "tags": //标签 分页
      k = await renderBlog(url);
      break;
    default:
      //其他页面返回404
      k= new Response(OPT.html404,{
        headers:{
          "content-type":"text/html;charset=UTF-8"
        },
        status:200
      })
      break;
  }  
  //后台及非 GET 请求不缓存；仅缓存成功的前台 GET 响应
  try{
    if("admin"==paths[0] || request.method !== "GET"){
      k.headers.set("Cache-Control","no-store")
    }else if(cacheable && k.status === 200){
      k.headers.set("Cache-Control","public, max-age="+OPT.cacheTime);
      event.waitUntil(D.put(x,k.clone()));
    }
  }catch(e){}
  
  return withSecurityHeaders(k)
}

// 为所有响应统一添加浏览器安全响应头；不过度限制 CSP，以免破坏现有主题及后台脚本。
function withSecurityHeaders(response){
  const headers=new Headers(response.headers);
  headers.set("X-Content-Type-Options","nosniff");
  headers.set("X-Frame-Options","SAMEORIGIN");
  headers.set("Referrer-Policy","strict-origin-when-cross-origin");
  headers.set("Permissions-Policy","camera=(), microphone=(), geolocation=()");
  if(headers.get("Cache-Control")===null) headers.set("Cache-Control","no-store");
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

// XML 文本节点转义，防止标题、正文或固定链接破坏 XML 结构。
function escapeXml(value){
  return String(value==null?"":value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&apos;");
}

// sitemap 字段使用白名单，避免 KV 中异常值注入 XML 标签或非法元数据。
function safeSitemapDate(value){
  const date=String(value||"").slice(0,10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) ? date : new Date().toISOString().slice(0,10);
}
function safeSitemapChangefreq(value){
  const allowed=["always","hourly","daily","weekly","monthly","yearly","never"];
  const normalized=String(value||"daily").toLowerCase();
  return allowed.includes(normalized)?normalized:"daily";
}
function safeSitemapPriority(value){
  const number=Number(value===undefined?"0.5":value);
  return Number.isFinite(number) && number>=0 && number<=1 ? number.toFixed(1) : "0.5";
}

/**------【③.分而治之：各种请求分开处理】-----**/

//访问: favicon.ico
async function handle_favicon(request){
  /*
  想要自定义，或者用指定的ico，可将此请求置为404，并在codeBeforHead中自行添加类似代码：
    <link rel="icon" type="image/x-icon" href="https://cdn.jsdelivr.net/gh/gdtool/zhaopp/cfblog/favicon.ico" />
    <link rel="Shortcut Icon" href="https://cdn.jsdelivr.net/gh/gdtool/zhaopp/cfblog/favicon.ico">
  */
  /*
  return new Response("404",{
      headers:{
          "content-type":"text/plain;charset=UTF-8"
      },
      status:404
  });
  */
  let url = new URL(request.url)
  url.host="dash.cloudflare.com"
  return await fetch(new Request(url, request));
}

//访问: robots.txt
async function handle_robots(request){
  return new Response(OPT.robots+"\nSitemap: https://"+OPT.siteDomain+"/sitemap.xml",{
    headers:{
      "content-type":"text/plain;charset=UTF-8"
    },
    status:200
  });
}

//访问: sitemap.xml
async function handle_sitemap(request){
  //如果设置了参数，则使用参数指定的url
  //可使用github action方式自动定期更新
  let xml;
  if(OPT.sitemap_xml_url){
    
    //cf代理方式，速度可以，实时性更好
    let url = new URL(request.url)
    url.href = OPT.sitemap_xml_url.replace('cdn.jsdelivr.net/gh','raw.githubusercontent.com').replace('@','/');
    xml = await fetch(new Request(url, request));
    xml = await xml.text();
    
    ////302方式，如果使用jsdelivr作为cdn，速度快，但更新有延迟
    //return new Response("",{
    //    headers:{
    //        "location":OPT.sitemap_xml_url
    //    },
    //    status:302
    //});
  
  }else{ //未配置参数，则实时获取结构
  
    //读取文章列表，并按照特定的xml格式进行组装
    let articles_all=await getArticlesList()
    xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    for(var i=0;i<articles_all.length;i++){
      xml+="\n\t<url>",
      xml+="\n\t\t<loc>"+escapeXml("https://"+OPT.siteDomain+"/article/"+articles_all[i].id+"/"+articles_all[i].link+".html")+"</loc>",
      xml+="\n\t\t<lastmod>"+escapeXml(safeSitemapDate(articles_all[i].createDate))+"</lastmod>",
      xml+="\n\t\t<changefreq>"+safeSitemapChangefreq(articles_all[i].changefreq)+"</changefreq>",
      xml+="\n\t\t<priority>"+safeSitemapPriority(articles_all[i].priority)+"</priority>",
      xml+="\n\t</url>";
    }
    xml+="\n</urlset>"
  }
  return new Response(xml,{
    headers:{
        "content-type":"text/xml;charset=UTF-8"
    },
    status:200
  });
}

//访问: search.xml
async function handle_search(request){
  //如果设置了参数，则使用参数指定的url
  //可使用github action方式自动定期更新
  let xml;
  if(OPT.search_xml_url){
    
    //cf代理方式，速度可以，实时性更好
    let url = new URL(request.url)
    url.href = OPT.search_xml_url.replace('cdn.jsdelivr.net/gh','raw.githubusercontent.com').replace('@','/');
    xml = await fetch(new Request(url, request));
    xml = await xml.text();
    
    ////302方式，如果使用jsdelivr作为cdn，速度快，但更新有延迟
    //return new Response("",{
    //    headers:{
    //        "location":OPT.search_xml_url
    //    },
    //    status:302
    //});
  
  }else{ //未配置参数，则实时获取结构
  
    //读取文章列表，并按照特定的xml格式进行组装
    let articles_all=await getArticlesList()
    xml='<?xml version="1.0" encoding="UTF-8"?>\n<blogs>';
    for(var i=0;i<articles_all.length;i++){
      xml+="\n\t<blog>",
      xml+="\n\t\t<title>"+escapeXml(articles_all[i].title)+"</title>";
      let article = await getArticle(articles_all[i].id);
      if(null != article){
        xml+="\n\t\t<content>"+escapeXml(article.contentMD)+"</content>"
      }
      xml+="\n\t\t<url>"+escapeXml("https://"+OPT.siteDomain+"/article/"+articles_all[i].id+"/"+articles_all[i].link+".html")+"</url>",
      xml+="\n\t\t<time>"+escapeXml(safeSitemapDate(articles_all[i].createDate))+"</time>",
      xml+="\n\t</blog>";
    }
    xml+="\n</blogs>"
  }
  return new Response(xml,{
    headers:{
      "content-type":"text/xml;charset=UTF-8"
    },
    status:200
  });
}

//渲染前端博客：指定一级路径page\tags\category，二级路径value，以及页码，默认第一页
async function renderBlog(url){
  console.log("---进入renderBlog函数---，path=", url.href.substr(url.origin.length))
  
  //处理主题预览及分页
  let theme=url.searchParams.get("theme"),
      pageSize=url.searchParams.get("pageSize");
  if(theme){
    OPT.themeURL=OPT.theme_github_path+theme+"/";
  }
  if(pageSize){
    OPT.pageSize=parseInt(pageSize);
  }
  //如果采用默认default主题，则改为加载default2.0主题
  if(OPT.theme_github_path+"default/"==OPT.themeURL){
    OPT.themeURL=OPT.theme_github_path+"default2.0/";
  }
  console.log("theme pageSize",OPT.pageSize,OPT.themeURL)
  
  //获取主页模板源码
  let theme_html=await getThemeHtml("index"),
      //KV中读取导航栏、分类目录、标签、链接、所有文章、近期文章等配置信息
      menus=await getWidgetMenu(),
      categories=await getWidgetCategory(),
      tags=await getWidgetTags(),
      links=await getWidgetLink(),
      articles_all=await getArticlesList(),
      articles_recently=await getRecentlyArticles(articles_all);
  
  /** 前台博客
   *  路径格式：
   *  域名/              文章列表首页，等价于域名/page/1
   *  域名/page/xxx      文章列表翻页
   * 
   *  域名/category/xxx  分类页，等价于域名/category/xxx/page/1
   *  域名/category/xxx/page/xxx  分类页+翻页
   * 
   *  域名/tags/xxx      标签页，等价于域名/tags/xxx/page/1
   *  域名/tags/xxx/page/xxx  分类页+翻页
   * 
   */
  let paths = url.pathname.trim("/").split("/")
  let articles=[],
      pageNo=1,
      archiveYear=url.searchParams.get("year")||"";
  if(archiveYear && /^\d{4}$/.test(archiveYear)){
    articles=articles_all.filter(a=>String(a.createDate||"").startsWith(archiveYear));
    pageNo=url.searchParams.get("p")||1;
  }
  //获取文章列表
  if(!archiveYear) switch(paths[0]||"page"){
  case "page":
    articles = articles_all
    pageNo = paths[1]||1
    break;
  case "tags":
  case "category":
    let category_tag = paths.slice(1).join("");//如果无分页，tags、category后面都是标签、分类名
    if(paths.length>3 && paths.includes("page")){
      pageNo = paths[paths.indexOf("page")+1] //分页的页码
      category_tag = paths.slice(1, paths.lastIndexOf("page")-1).join("") //tags、category后，分页前的为标签、分类名
    }
    category_tag = decodeURIComponent(category_tag)
    articles = articles_all.filter(a => { const values=Array.isArray(a[paths[0]])?a[paths[0]]:(a[paths[0]]==null?[]:[a[paths[0]]]); return values.map(String).includes(category_tag); })
    break;
  }
  pageNo = parseInt(pageNo,10)
  if(!Number.isFinite(pageNo) || pageNo<1) pageNo=1;
  // console.log(pageNo)
  // console.log(articles)

  //获取当页要显示文章列表
  let articles_show = articles.slice((pageNo-1)*OPT.pageSize,pageNo*OPT.pageSize);
  // console.log(articles_show)
  
  //处理文章属性（年月日、url等）
  processArticleProp(articles_show);

  // console.log(url.pathname)
  let url_prefix = url.pathname.replace(/(.*)\/page\/\d+/,'$1/')
  if(url_prefix.substr(-1)=='/'){
    url_prefix=url_prefix.substr(0,url_prefix.length-1);
  }
  // console.log(url_prefix)
  //组装各种参数
  let newer=[{title:"上一页",url:archiveYear?"/?year="+encodeURIComponent(archiveYear)+"&p="+(pageNo-1):url_prefix+"/page/"+(pageNo-1)}];
  if(1==pageNo){
    newer=[];
  }
  let older=[{title:"下一页",url:archiveYear?"/?year="+encodeURIComponent(archiveYear)+"&p="+(pageNo+1):url_prefix+"/page/"+(pageNo+1)}];
  if(pageNo*OPT.pageSize>=articles.length){
    older=[];
  }
  // console.log(newer)
  // console.log(older)

  //文章标题、关键字
  let title=(pageNo>1 ? "page "+pageNo+" - " : "")+OPT.siteName,
      keyWord=OPT.keyWords,
      cfg={};
  cfg.widgetMenuList=menus,//导航
  cfg.widgetCategoryList=categories,//分类目录
  cfg.widgetTagsList=tags,//标签
  cfg.widgetLinkList=links,//链接
  cfg.widgetRecentlyList=articles_recently,//近期文章
  cfg.articleList=articles_show,//当前页文章列表
  cfg.pageNewer=newer,//上翻页链接
  cfg.pageOlder=older,//下翻页链接
  cfg.title=title,//网页title
  cfg.keyWords=keyWord;//SEO关键字

  // 首页侧栏资料、年度归档和全站统计。
  const yearMap={};
  for(const item of articles_all){
    const year=String(item.createDate||"").slice(0,4);
    if(/^\d{4}$/.test(year)) yearMap[year]=(yearMap[year]||0)+1;
  }
  cfg.archiveList=Object.keys(yearMap).sort((a,b)=>b.localeCompare(a)).map(year=>({year,count:yearMap[year]}));
  const categorySet=new Set(),tagSet=new Set();
  for(const item of articles_all){
    (Array.isArray(item.category)?item.category:[item.category]).filter(Boolean).forEach(v=>categorySet.add(String(v)));
    (Array.isArray(item.tags)?item.tags:[item.tags]).filter(Boolean).forEach(v=>tagSet.add(String(v)));
  }
  cfg.categoryItems=Array.from(categorySet).map(name=>({name,url:"/category/"+encodeURIComponent(name)}));
  cfg.tagItems=Array.from(tagSet).map(name=>({name,url:"/tags/"+encodeURIComponent(name)}));
  cfg.linkItems=(Array.isArray(links)?links:[]).map(item=>{
    const name=typeof item==="string"?item:(item.name||item.title||item.text||"");
    const target=typeof item==="string"?item:(item.url||item.link||"");
    const safeTarget=String(target).startsWith("https://") || String(target).startsWith("http://") || (String(target).startsWith("/") && !String(target).startsWith("//"));
    return name && safeTarget ? {name:String(name),url:String(target)} : null;
  }).filter(Boolean);
  cfg.blogArticleCount=articles_all.length;
  cfg.blogWordCount=(await getBlogWordCount(articles_all)).toLocaleString("zh-CN");
  cfg.blogYearCount=Object.keys(yearMap).length;
  cfg.currentYear=new Date().getFullYear();
  cfg.pageNo=pageNo;
  cfg.isArchive=!!archiveYear;

  //使用mustache.js进行页面渲染（参数替换）
  cfg.OPT=OPT
  
  let html = Mustache.render(theme_html,cfg)
  
  return new Response(html,{
    headers:{
      "content-type":"text/html;charset=UTF-8"
    },
    status:200
  })
}

// 将旧版本文章的 Markdown 正文转换为可读 HTML；文本先转义，避免把 Markdown 当作任意 HTML 执行。
function escapeArticleHtml(value){
  return String(value==null?"":value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function legacyMarkdownToHtml(markdown){
  const source=String(markdown||"").replace(/\r\n?/g,"\n");
  if(!source.trim()) return "";
  const lines=source.split("\n"),out=[];
  let paragraph=[],listType="",inCode=false,code=[];
  const inline=value=>escapeArticleHtml(value)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g,"<em>$1</em>")
    .replace(/`([^`]+)`/g,"<code>$1</code>");
  const flushParagraph=()=>{if(paragraph.length){out.push("<p>"+paragraph.map(inline).join("<br>")+"</p>");paragraph=[];}};
  const flushList=()=>{if(listType){out.push("</"+listType+">");listType="";}};
  for(const line of lines){
    if(/^\s*```/.test(line)){
      flushParagraph();flushList();
      if(inCode){out.push("<pre><code>"+escapeArticleHtml(code.join("\n"))+"</code></pre>");code=[];inCode=false;}
      else inCode=true;
      continue;
    }
    if(inCode){code.push(line);continue;}
    if(!line.trim()){flushParagraph();flushList();continue;}
    const heading=line.match(/^(#{1,6})\s+(.+)$/);
    if(heading){flushParagraph();flushList();const level=heading[1].length;out.push("<h"+level+">"+inline(heading[2])+"</h"+level+">");continue;}
    const quote=line.match(/^>\s?(.*)$/);
    if(quote){flushParagraph();flushList();out.push("<blockquote>"+inline(quote[1])+"</blockquote>");continue;}
    const item=line.match(/^\s*([-*+] |\d+\. )(.*)$/);
    if(item){flushParagraph();const type=/^\s*\d+\./.test(line)?"ol":"ul";if(listType!==type){flushList();out.push("<"+type+">");listType=type;}out.push("<li>"+inline(item[2])+"</li>");continue;}
    flushList();paragraph.push(line);
  }
  if(inCode) out.push("<pre><code>"+escapeArticleHtml(code.join("\n"))+"</code></pre>");
  flushParagraph();flushList();
  return out.join("\n");
}

// 极简博客文章详情页：与首页共用品牌、搜索入口和右侧抽屉导航。
function minimalArticleTemplate(){
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{{articleSingle.title}}">
<meta name="keywords" content="{{keyWords}}">
<title>{{title}}</title>
<style>
:root{--bg:#fff;--fg:#242424;--muted:#858585;--line:#ececec;--soft:#f7f7f7;--width:760px}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.85 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}a:hover{color:#777}.site{width:min(var(--width),calc(100% - 44px));margin:0 auto}
.topbar{height:88px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line)}.brand{font-size:25px;font-weight:700;letter-spacing:-.7px}.brand small{display:block;font-size:10px;letter-spacing:2px;color:var(--muted);font-weight:500;line-height:1.2}
.menu-button{width:42px;height:42px;border:1px solid var(--line);background:#fff;border-radius:50%;display:grid;place-content:center;gap:5px;cursor:pointer}.menu-button span{display:block;width:16px;height:1.5px;background:#333}
.article-head{padding:54px 0 30px;border-bottom:1px solid var(--line)}.back{font-size:12px;color:#888;letter-spacing:1px}.article-head h1{font-size:clamp(27px,5vw,36px);line-height:1.45;letter-spacing:-.7px;margin:18px 0 14px;font-weight:700}.meta{font-size:12px;color:#999;display:flex;gap:13px;flex-wrap:wrap}.taxonomies{display:flex;gap:8px;flex-wrap:wrap;margin-top:17px}.taxonomies a{font-size:12px;color:#777;background:var(--soft);padding:3px 10px;border-radius:2px}
.article-body{padding:35px 0 48px;font-size:16px;line-height:2;color:#333;overflow-wrap:anywhere}.article-body img{max-width:100%;height:auto;display:block;margin:24px auto}.article-body video,.article-body iframe{max-width:100%}.article-body h1,.article-body h2,.article-body h3,.article-body h4{line-height:1.5;margin:1.8em 0 .7em;color:#222}.article-body p{margin:0 0 1.35em}.article-body a{color:#555;text-decoration:underline;text-underline-offset:3px}.article-body blockquote{margin:1.5em 0;padding:3px 18px;border-left:3px solid #ddd;color:#777;background:#fafafa}.article-body pre{overflow:auto;padding:17px;background:#f6f6f6;border-radius:3px;font-size:13px;line-height:1.7}.article-body code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#f5f5f5;padding:2px 5px;border-radius:3px}.article-body pre code{padding:0;background:none}.article-body table{border-collapse:collapse;display:block;overflow:auto;max-width:100%}.article-body th,.article-body td{border:1px solid #e5e5e5;padding:7px 12px}.article-body hr{border:0;border-top:1px solid var(--line);margin:2em 0}.article-body ul,.article-body ol{padding-left:1.7em}
.article-foot{border-top:1px solid var(--line);padding:24px 0 35px}.post-nav{display:grid;grid-template-columns:1fr 1fr;gap:18px}.post-nav a{padding:15px;border:1px solid var(--line);min-width:0}.post-nav small{display:block;color:#999;font-size:11px;letter-spacing:1px}.post-nav span{display:block;margin-top:5px;font-size:14px;overflow-wrap:anywhere}.post-nav .next{text-align:right}
footer{padding:25px 0 42px;border-top:1px solid var(--line);color:#999;font-size:12px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}.footer-copy a{text-decoration:underline;text-underline-offset:3px}
.drawer-mask{position:fixed;inset:0;background:rgba(0,0,0,.28);opacity:0;visibility:hidden;transition:.25s;z-index:9}.drawer{position:fixed;z-index:10;right:0;top:0;height:100%;width:min(360px,88vw);background:#fff;padding:26px 28px;overflow:auto;transform:translateX(102%);transition:transform .28s ease;box-shadow:-10px 0 35px rgba(0,0,0,.05)}.drawer.open{transform:translateX(0)}.drawer-mask.open{opacity:1;visibility:visible}.drawer-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:20px;border-bottom:1px solid var(--line);font-weight:650}.drawer-close{border:0;background:none;font-size:25px;cursor:pointer}.drawer-section{padding:18px 0;border-bottom:1px solid var(--line)}.drawer-section h3{font-size:11px;color:#999;letter-spacing:1.5px;font-weight:500;margin:0 0 10px}.drawer-section a{display:inline-block;margin:4px 12px 4px 0;font-size:13px}.drawer-search{display:flex;border-bottom:1px solid #ddd;padding:7px 0}.drawer-search input{border:0;outline:0;min-width:0;flex:1;font:inherit;font-size:13px}.drawer-search button{border:0;background:none;cursor:pointer;color:#777}
@media(max-width:600px){.topbar{height:76px}.article-head{padding:38px 0 24px}.article-body{font-size:15px;padding-top:27px}.post-nav{grid-template-columns:1fr}.post-nav .next{text-align:left}}
</style>
</head>
<body>
<div class="site">
<header class="topbar"><a class="brand" href="/">{{OPT.siteName}}<small>PERSONAL BLOG</small></a><button class="menu-button" id="menuOpen" aria-label="打开导航菜单" aria-expanded="false"><span></span><span></span><span></span></button></header>
<main>
<header class="article-head"><a class="back" href="/">← 返回首页</a><h1>{{articleSingle.title}}</h1><div class="meta"><span>{{articleSingle.createDate10}}</span><span>{{articleSingle.contentLength}} 字</span></div>
<div class="taxonomies">{{#articleSingle.category}}<a href="/category/{{.}}">{{.}}</a>{{/articleSingle.category}}{{#articleSingle.tags}}<a href="/tags/{{.}}"># {{.}}</a>{{/articleSingle.tags}}</div></header>
<article class="article-body">{{{articleSingle.contentHtml}}}</article>
<section class="article-foot"><nav class="post-nav">
{{#articleOlder}}<a href="{{url}}"><small>上一篇</small><span>{{title}}</span></a>{{/articleOlder}}
{{#articleNewer}}<a class="next" href="{{url}}"><small>下一篇</small><span>{{title}}</span></a>{{/articleNewer}}
</nav></section>
</main>
<footer><span>© {{currentYear}} {{OPT.siteName}}</span><span class="footer-copy">Powered by Cloudflare Workers</span></footer>
</div>
<div class="drawer-mask" id="drawerMask"></div><aside class="drawer" id="drawer" aria-hidden="true">
<div class="drawer-head"><span>导航</span><button class="drawer-close" id="menuClose" aria-label="关闭导航菜单">×</button></div>
<form class="drawer-section drawer-search" action="/search.xml" method="get" onsubmit="return false"><input id="articleSearch" type="search" placeholder="搜索文章…" aria-label="搜索文章"><button id="articleSearchButton" type="button">搜索</button></form><div id="articleSearchResults" class="drawer-section" hidden></div>
<section class="drawer-section"><h3>博客存档</h3>{{#archiveList}}<a href="/?year={{year}}">{{year}} ({{count}})</a>{{/archiveList}}</section>
<section class="drawer-section"><h3>分类</h3>{{#categoryItems}}<a href="{{url}}">{{name}}</a>{{/categoryItems}}</section>
<section class="drawer-section"><h3>标签</h3>{{#tagItems}}<a href="{{url}}"># {{name}}</a>{{/tagItems}}</section>
<section class="drawer-section"><h3>友情链接</h3>{{#linkItems}}<a href="{{url}}" target="_blank" rel="noopener noreferrer">{{name}}</a>{{/linkItems}}</section>
</aside>
<script>
(function(){
 const drawer=document.getElementById('drawer'),mask=document.getElementById('drawerMask'),open=document.getElementById('menuOpen');
 function toggle(show){drawer.classList.toggle('open',show);mask.classList.toggle('open',show);drawer.setAttribute('aria-hidden',String(!show));open.setAttribute('aria-expanded',String(show));}
 open.addEventListener('click',()=>toggle(true));document.getElementById('menuClose').addEventListener('click',()=>toggle(false));mask.addEventListener('click',()=>toggle(false));document.addEventListener('keydown',e=>{if(e.key==='Escape')toggle(false);});
 const input=document.getElementById('articleSearch'),button=document.getElementById('articleSearchButton'),results=document.getElementById('articleSearchResults');let data;
 button.addEventListener('click',async()=>{const q=input.value.trim().toLowerCase();if(!q)return;results.hidden=false;results.textContent='搜索中…';try{if(!data){const response=await fetch('/search.xml');if(!response.ok)throw new Error('search');const xml=new DOMParser().parseFromString(await response.text(),'text/xml');data=Array.from(xml.querySelectorAll('entry,blog,item')).map(node=>({title:node.querySelector('title')?.textContent||'',url:node.querySelector('url,link')?.textContent||'',content:node.textContent||''}));}const found=data.filter(item=>(item.title+' '+item.content).toLowerCase().includes(q)).slice(0,12);results.textContent='';const heading=document.createElement('h3');heading.textContent='搜索结果：'+found.length+' 条';results.appendChild(heading);found.forEach(item=>{if(!item.url.startsWith('/')&&!item.url.startsWith('http'))return;const a=document.createElement('a');a.href=item.url;a.textContent=item.title;results.appendChild(a);});if(!found.length)results.append('没有找到相关文章。');}catch(e){results.textContent='搜索暂不可用，请稍后再试。';data=null;}});
 input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();button.click();}});
})();
</script>
</body></html>`;
}

//渲染前端博客的文章内容页
async function handle_article(id){
  //禁止通过猜测文章 ID 直接访问草稿和未到发布时间的定时文章。
  const requestedArticle=await getArticle(id);
  if(!requestedArticle || requestedArticle.hidden || requestedArticle.status==="draft"){
    return new Response(OPT.html404,{headers:{"content-type":"text/html;charset=UTF-8"},status:404});
  }
  if(requestedArticle.status==="scheduled"){
    const publishAt=Date.parse(String(requestedArticle.scheduledAt||"").replace(" ","T"));
    if(!Number.isFinite(publishAt) || publishAt>Date.now()){
      return new Response(OPT.html404,{headers:{"content-type":"text/html;charset=UTF-8"},status:404});
    }
  }

  const menus=await getWidgetMenu(), categories=await getWidgetCategory(),
        tags=await getWidgetTags(), links=await getWidgetLink(),
        articles_recently=await getRecentlyArticles();
  let articles_sibling=await getSiblingArticle(id);
  if(!articles_sibling || !articles_sibling[1]) articles_sibling=[undefined,requestedArticle,undefined];
  processArticleProp(articles_sibling.filter(Boolean));
  const article=articles_sibling[1];
  article.title=String(article.title||"").replace(nullToEmpty(OPT.top_flag),"").replace(nullToEmpty(OPT.hidden_flag),"");
  article.createDate10=String(article.createDate||"").slice(0,10);
  // 新版文章优先使用富文本 HTML；旧文章通常只有 contentMD，需转换后展示完整正文，
  // 不能退回 contentText，因为它只是首页摘要。
  const rawContent=String(article.contentHtml||"");
  if(rawContent.trim()){
    article.contentHtml=rawContent;
  }else{
    article.contentHtml=legacyMarkdownToHtml(article.contentMD||article.contentText||"");
  }
  article.contentLength=String(article.contentText||article.contentMD||"").replace(/\s/g,"").length;
  article.category=Array.isArray(article.category)?article.category:(article.category?[article.category]:[]);
  article.tags=Array.isArray(article.tags)?article.tags:(article.tags?[article.tags]:[]);
  for(const sibling of [articles_sibling[0],articles_sibling[2]]){
    if(sibling){
      sibling.title=String(sibling.title||"");
      sibling.url="/article/"+sibling.id+"/"+(sibling.link||"")+".html";
    }
  }
  const title=article.title+" - "+OPT.siteName;
  const allArticles=await getArticlesList(), yearMap={};
  for(const item of allArticles){const year=String(item.createDate||"").slice(0,4);if(/^\d{4}$/.test(year))yearMap[year]=(yearMap[year]||0)+1;}
  const categorySet=new Set(),tagSet=new Set();
  for(const item of allArticles){
    (Array.isArray(item.category)?item.category:[item.category]).filter(Boolean).forEach(v=>categorySet.add(String(v)));
    (Array.isArray(item.tags)?item.tags:[item.tags]).filter(Boolean).forEach(v=>tagSet.add(String(v)));
  }
  const linkItems=(Array.isArray(links)?links:[]).map(item=>{
    const name=typeof item==="string"?item:(item.name||item.title||item.text||"");
    const target=typeof item==="string"?item:(item.url||item.link||"");
    const safe=/^https?:\/\//i.test(String(target)) || (String(target).startsWith("/")&&!String(target).startsWith("//"));
    return name&&safe?{name:String(name),url:String(target)}:null;
  }).filter(Boolean);
  const cfg={
    widgetMenuList:menus,widgetCategoryList:categories,widgetTagsList:tags,widgetLinkList:links,
    widgetRecentlyList:articles_recently,
    articleOlder:articles_sibling[0]?[articles_sibling[0]]:[],
    articleSingle:article,
    articleNewer:articles_sibling[2]?[articles_sibling[2]]:[],
    title,keyWords:[...article.tags,...article.category].join(","),
    archiveList:Object.keys(yearMap).sort((a,b)=>b.localeCompare(a)).map(year=>({year,count:yearMap[year]})),
    categoryItems:Array.from(categorySet).map(name=>({name,url:"/category/"+encodeURIComponent(name)})),
    tagItems:Array.from(tagSet).map(name=>({name,url:"/tags/"+encodeURIComponent(name)})),
    linkItems,currentYear:new Date().getFullYear(),OPT
  };
  const html=Mustache.render(minimalArticleTemplate(),cfg);
  return new Response(html,{headers:{"content-type":"text/html;charset=UTF-8"},status:200});
}

//后台请求处理
async function handle_admin(request){
  let url = new URL(request.url),
      paths = url.pathname.trim("/").split("/"),
      html,//返回html
      json,//返回json
      file;//返回文件
  //新建页
  if(1==paths.length||"list"==paths[1]){
    //读取主题的admin/index.html源码
    let theme_html=await getThemeHtml("admin/index"),
        //KV中读取导航栏、分类目录、链接、近期文章等配置信息
        categoryJson=await getWidgetCategory(),
        menuJson=await getWidgetMenu(),
        linkJson=await getWidgetLink(),
        blogSettings=await getSavedBlogSettings();
    
    //手动替换<!--{xxx}-->格式的参数
    html = theme_html.replaceHtmlPara("categoryJson",JSON.stringify(categoryJson))
                    .replaceHtmlPara("menuJson",JSON.stringify(menuJson))
                    .replaceHtmlPara("linkJson",JSON.stringify(linkJson))
    // 设置页分为“编辑设置”和“博客设置”；博客资料从 KV 读取并回填。
    const settingsUi=`<h3 style="margin-top:0">博客设置</h3><form id="blogSettingsForm" role="form"><div class="form-group"><label for="cfblog-site-name">博客名称</label><input class="form-control" id="cfblog-site-name" name="siteName" maxlength="100" required></div><div class="form-group"><label for="cfblog-site-description">博客简介（SEO 描述）</label><textarea class="form-control" id="cfblog-site-description" name="siteDescription" rows="3" maxlength="500"></textarea></div><div class="form-group"><label for="cfblog-site-intro">自我介绍（显示在博客首页）</label><textarea class="form-control" id="cfblog-site-intro" name="siteIntro" rows="5" maxlength="2000"></textarea></div><button type="button" class="btn btn-primary" id="cfblog-save-blog-settings">保存博客设置</button></form><hr>`;
    html=html.replace(`<form id="configForm" role="form" >`,`<form id="configForm" role="form" ><h3>编辑设置</h3>`);
    html=html.replace(`<div class="container" >\n\t\t\t<form id="configForm"`,`<div class="container" >\n\t\t\t${settingsUi}<form id="configForm"`);
    const blogSettingsJson=JSON.stringify({siteName:blogSettings.siteName||OPT.siteName,siteDescription:blogSettings.siteDescription||OPT.siteDescription,siteIntro:blogSettings.siteIntro||OPT.siteIntro}).replace(/</g,"\\u003c");
    html=html.replace(`</body>`,`<script>(function(){const v=${blogSettingsJson};document.getElementById("cfblog-site-name").value=v.siteName||"";document.getElementById("cfblog-site-description").value=v.siteDescription||"";document.getElementById("cfblog-site-intro").value=v.siteIntro||"";document.getElementById("cfblog-save-blog-settings").addEventListener("click",function(){const form=document.getElementById("blogSettingsForm");const data=["siteName","siteDescription","siteIntro"].map(name=>({name,value:form.elements[name].value}));fetch("/admin/saveConfig/",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}).then(async r=>{const x=await r.json();if(!r.ok||!x.rst)throw new Error(x.msg||("HTTP "+r.status));alert(x.msg);}).catch(e=>alert("保存失败："+e.message));});})();</script></body>`);
//添加后台首页配置
    if(OPT.admin_home_idx && OPT.admin_home_idx>=1 && OPT.admin_home_idx<=4){
      html = html.replace("$('#myTab li:eq(0) 1').tab('show')","$($('#myTab a[href*=\"'+location.hash+'\"]')[0]||$('#myTab a:eq("+OPT.admin_home_idx+")')).tab('show')")
    }
    //添加置顶样式
    if(OPT.top_flag_style){
      html += OPT.top_flag_style
    }
    //添加隐藏样式
    if(OPT.hidden_flag_style){
      html += OPT.hidden_flag_style
    }
  }

  //发布
  if("publish"==paths[1]){
    //KV中获取文章列表
    let articles_all=await getAllArticlesList(),
        tags=[]; //操作标签
    
    //遍历所有文章，汇集所有的tag
    for(var i=0;i<articles_all.length;i++){
      //若文章设定了标签
      if(articles_all[i].status!=="draft" && articles_all[i].status!=="scheduled" && !articles_all[i].hidden && "object"==typeof articles_all[i].tags){
        //将所有tags存入e中
        for(var j=0;j<articles_all[i].tags.length;j++){
          if(articles_all[i].tags[j] 
            && articles_all[i].tags[j].length>0 
            && -1==tags.indexOf(articles_all[i].tags[j])){
            tags.push(articles_all[i].tags[j]);
          }
        }
      }
    }
    console.log(articles_all)
    //将所有标签一次性写入到KV中，并清除缓存
    await saveWidgetTags(JSON.stringify(tags))
    
    json = await purge()?'{"msg":"published ,purge Cache true","rst":true}':'{"msg":"published ,buuuuuuuuuuuut purge Cache false !!!!!!","rst":true}'
      
  }

  //文章列表
  if("getList"==paths[1]){
    //默认取第一页，每页20篇
    let pageNo=(undefined===paths[2]) ? 1 : parseInt(paths[2]),
        list=await admin_nextPage(pageNo, 20);//每次加载20个
    json = JSON.stringify(list)
  }
  
  //修改文章
  if("edit"==paths[1]){
    let id=paths[2],
        //获取主题admin/edit源码
        theme_html=await getThemeHtml("admin/edit"),
        //KV中读取分类
        categoryJson=JSON.stringify(await getWidgetCategory()),
        //KV中读取文章内容
        articleJson=JSON.stringify(await getArticle(id));
    
    //手动替换<!--{xxx}-->格式的参数
    html = theme_html.replaceHtmlPara("categoryJson",categoryJson).replaceHtmlPara("articleJson",articleJson.replaceAll("script>","script＞"))
    // 服务端直接给主题原有的 id 输入框赋值，避免重复字段导致空值覆盖真实 ID。
    if(/^\d{6}$/.test(String(id||""))){
      const idInputPattern=/<input\b(?=[^>]*\bname=["']id["'])[^>]*>/i;
      html=html.replace(idInputPattern,function(tag){
        tag=tag.replace(/\svalue=["'][^"']*["']/i,"");
        return tag.replace(/\s*\/?>$/,"").replace(/\s*\/?>$/,"") + ' value="'+String(id)+'">';
      });
    }
  }
  
  //保存博客设置：仅允许修改博客名称、博客简介和自我介绍，不覆盖 Worker 的其他配置。
  if("saveConfig"==paths[1]){
    let payload=[];
    try{payload=await request.json();}catch(e){payload=[];}
    const values={};
    if(Array.isArray(payload)){
      for(const item of payload){if(item&&["siteName","siteDescription","siteIntro"].includes(item.name)) values[item.name]=String(item.value==null?"":item.value).trim();}
    }else if(payload&&typeof payload==="object"){
      for(const key of ["siteName","siteDescription","siteIntro"]) if(payload[key]!==undefined) values[key]=String(payload[key]==null?"":payload[key]).trim();
    }
    const current=await getSavedBlogSettings();
    const next={...current};
    for(const key of ["siteName","siteDescription","siteIntro"]){if(values[key]!==undefined) next[key]=values[key];}
    const limits={siteName:100,siteDescription:500,siteIntro:2000};
    const invalid=Object.keys(limits).find(key=>String(next[key]||"").length>limits[key]);
    if(invalid || !String(next.siteName||"").trim()){
      json=JSON.stringify({msg:invalid?("保存失败："+invalid+"超过长度限制"):"博客名称不能为空",rst:false});
    }else{
      await CFBLOG.put("SYSTEM_BLOG_SETTINGS",JSON.stringify(next));
      const version=Number(await CFBLOG.get("SYSTEM_PUBLIC_CACHE_VERSION"))||1;
      await CFBLOG.put("SYSTEM_PUBLIC_CACHE_VERSION",String(version+1));
      await applySavedBlogSettings();
      json=JSON.stringify({msg:"博客设置已保存",rst:true});
    }
  }

  //导入
  if("import"==paths[1]){
    const importJson=(await parseReq(request)).importJson;
    console.log("开始导入");
    
    if(checkFormat(importJson)){
      const importData=JSON.parse(importJson),
          keys=Object.keys(importData);
      for(let i=0;i<keys.length;++i){
        await saveArticle(keys[i],importData[keys[i]]);
      }
      json = '{"msg":"import success!","rst":true}'
    }else{
      json = '{"msg":" importJson Not a JSON object","rst":false}'
    }        
  }
  
  //导出
  if("export"===paths[1]){
    console.log("开始导出");
    async function exportArticle(arr=[],cursor="",limit=1){
      //分页获取文章内容
      const list=await CFBLOG.list({limit:limit,cursor:cursor});
      if(!list || !Array.isArray(list.keys)) return {};
      arr=arr.concat(list.keys)
      console.log("导出: ",typeof list, JSON.stringify(list))
      //判断是否导出完毕
      if(list.list_complete){
        let ret = {OPT:OPT};
        for(let i=0;i<arr.length;++i){
          const article = await CFBLOG.get(arr[i].name);
          if(null != article){
            ret[arr[i].name] = checkFormat(article)?JSON.parse(article):article
          }
        }
        return ret
      }
      return await exportArticle(arr,list.cursor,limit)
    }
    
    let articles=await exportArticle();
    file = {
      name: "cfblog-"+new Date().getTime()+".json",
      content: JSON.stringify(articles)
    }
  }
  
  //导出search.xml 
  if("search.xml"===paths[1]){
    console.log("开始导出");
    //读取文章列表，并按照特定的xml格式进行组装
    let articles_all=await getArticlesList()
    let xml='<?xml version="1.0" encoding="UTF-8"?>\n<blogs>';
    for(var i=0;i<articles_all.length;i++){
      xml+="\n\t<blog>",
      xml+="\n\t\t<title>"+escapeXml(articles_all[i].title)+"</title>";
      let article = await getArticle(articles_all[i].id);
      if(null != article){
        xml+="\n\t\t<content>"+escapeXml(article.contentMD)+"</content>"
      }
      xml+="\n\t\t<url>"+escapeXml("https://"+OPT.siteDomain+"/article/"+articles_all[i].id+"/"+articles_all[i].link+".html")+"</url>",
      xml+="\n\t\t<time>"+escapeXml(safeSitemapDate(articles_all[i].createDate))+"</time>",
      xml+="\n\t</blog>";
    }
    xml+="\n</blogs>"
    file = {
      name: "search.xml",
      content: xml
    }
  }
  
  //导出sitemap.xml 
  if("sitemap.xml"===paths[1]){
    console.log("开始导出");
    //读取文章列表，并按照特定的xml格式进行组装
    let articles_all=await getArticlesList()
    let xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    for(var i=0;i<articles_all.length;i++){
      xml+="\n\t<url>",
      xml+="\n\t\t<loc>"+escapeXml("https://"+OPT.siteDomain+"/article/"+articles_all[i].id+"/"+articles_all[i].link+".html")+"</loc>",
      xml+="\n\t\t<lastmod>"+escapeXml(safeSitemapDate(articles_all[i].createDate))+"</lastmod>",
      xml+="\n\t\t<changefreq>"+safeSitemapChangefreq(articles_all[i].changefreq)+"</changefreq>",
      xml+="\n\t\t<priority>"+safeSitemapPriority(articles_all[i].priority)+"</priority>",
      xml+="\n\t</url>";
    }
    xml+="\n</urlset>"
    file = {
      name: "sitemap.xml",
      content: xml
    }
  }
  
  //草稿箱：仅后台可见，不进入公开文章列表
  if("getDrafts"==paths[1]){
    let all=await getAllArticlesList();
    json=JSON.stringify(all.filter(a=>a.status==="draft"));
  }

  //定时发布任务状态与待发布列表
  if("getScheduled"==paths[1]){
    let all=await getAllArticlesList();
    json=JSON.stringify(all.filter(a=>a.status==="scheduled"));
  }

  //新建文章
  if("saveAddNew"==paths[1]){
    const ret=await parseReq(request);
    let title=String(ret.title||(ret.status==="draft"?"未命名草稿":"")),//文章标题
        img=ret.img||"",//插图
        link=ret.link||"",//永久链接
        createDate=String(ret.createDate||"").replace('T',' '),//发布日期
        category=Array.isArray(ret.category)?ret.category:(ret.category?[ret.category]:[]),//分类
        tags=Array.isArray(ret.tags)?ret.tags:(ret.tags?[ret.tags]:[]),//标签
        priority=void 0===ret.priority?"0.5":ret.priority,//权重
        changefreq=void 0===ret.changefreq?"daily":ret.changefreq,//更新频率
        contentMD=String(ret["content-markdown-doc"]||""),//文章内容-md格式
        contentHtml=String(ret["content-html-code"]||""),//文章内容-html格式
        contentText="",//文章摘要
        top_timestamp=ret.top_timestamp*1,//置顶时间戳，不置顶时为0
        modify_timestamp=new Date().getTime()+8*60*60*1000,//修改时间戳
        hidden=ret.hidden*1,//是否隐藏
        status=["draft","scheduled"].includes(ret.status)?ret.status:"published",
        scheduledAt=String(ret.scheduledAt||""),
        id="";//文章id

    // 富文本编辑器可能只提交 HTML 或纯文本其中一个字段；发布前补齐另一种格式。
    if(!contentHtml.trim() && contentMD.trim()){
      contentHtml=contentMD.split(/\r?\n/).map(line=>line.trim()?"<p>"+line.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")+"</p>":"").join("");
    }
    if(!contentMD.trim() && contentHtml.trim()){
      contentMD=contentHtml.replace(/<br\s*\/?\s*>/gi,"\n").replace(/<\/(p|div|h[1-6]|li)>/gi,"\n").replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").trim();
    }
    
    // 校验字段长度与文章状态，避免异常输入占用 KV 或产生无效定时任务。
    const scheduleTime=Date.parse(String(scheduledAt||""));
    if(title.length>0 && title.length<=300
      && String(img).length<=2048 && String(link).length<=200
      && contentMD.length<=1000000 && contentHtml.length<=1000000
      && category.length<=30 && tags.length<=50
      && (status==="draft" || (createDate.trim().length>0 && contentHtml.trim().length>0))
      && (status!=="scheduled" || (Number.isFinite(scheduleTime) && scheduleTime>Date.now()))){

      id=await generateId(),
      contentText=contentHtml.replace(/<\/?[^>]*>/g,"").trim().substring(0,OPT.readMoreLength);//摘要
      //组装文章json
      let article={
        id:id,
        title:title,
        img:img,
        link:link,
        createDate:createDate,
        category:category,
        tags:tags,
        contentMD:contentMD,
        contentHtml:contentHtml,
        contentText:contentText,
        priority:priority,
        top_timestamp:top_timestamp,
        modify_timestamp:modify_timestamp,
        hidden:hidden,
        status:status,
        scheduledAt:scheduledAt,
        changefreq:changefreq
      };
      
      //将文章json写入KV（key为文章id，value为文章json字符串）
      await saveArticle(id,JSON.stringify(article));
      
      //组装文章json
      let articleWithoutHtml={
        id:id,
        title:title,
        img:img,
        link:link,
        createDate:createDate,
        category:category,
        tags:tags,
        contentText:contentText,
        priority:priority,
        top_timestamp:top_timestamp,
        modify_timestamp:modify_timestamp,
        hidden:hidden,
        status:status,
        scheduledAt:scheduledAt,
        changefreq:changefreq
      },
      articles_all_old=await getAllArticlesList(),//读取文章列表
      articles_all=[];
    
      //将最新的文章写入文章列表中，并按id排序后，再次回写到KV中
      articles_all.push(articleWithoutHtml),
      articles_all=articles_all.concat(articles_all_old),
      articles_all=sortArticle(articles_all),
      await saveArticlesList(JSON.stringify(articles_all))
      
      json = '{"msg":"added OK","rst":true,"id":"'+id+'"}'
    }else{
      const missing=[];
      if(!title.trim() || title.length>300) missing.push("标题为空或超过300字符");
      if(String(img).length>2048) missing.push("特色图片地址超过2048字符");
      if(String(link).length>200) missing.push("永久链接超过200字符");
      if(category.length>30) missing.push("分类数量超过30");
      if(tags.length>50) missing.push("标签数量超过50");
      if(contentMD.length>1000000 || contentHtml.length>1000000) missing.push("正文超过1MB");
      if(status!=="draft" && !createDate.trim()) missing.push("创建日期为空");
      if(status!=="draft" && !contentHtml.trim()) missing.push("正文为空（富文本 HTML 未同步）");
      if(status==="scheduled" && !(Number.isFinite(scheduleTime) && scheduleTime>Date.now())) missing.push("定时发布时间无效或已过期");
      json=JSON.stringify({msg:"保存失败："+(missing.join("；")||"字段校验未通过，请检查表单数据"),rst:false});
    }
  }
  
  //删除
  if("delete"==paths[1]){
    let id=paths[2]
    if(6==id.length){
      await CFBLOG.delete(id);
      let e=await getAllArticlesList();
      for(r=0;r<e.length;r++){
        if(id==e[r].id){
          e.splice(r,1);
          
          await saveArticlesList(JSON.stringify(e))
          json = '{"msg":"Delete ('+id+')  OK","rst":true,"id":"'+id+'"}'
          break;
        }
      }
    }else{
      json = '{"msg":"Delete  false ","rst":false,"id":"'+id+'"}'
    }
  }
  
  //批量管理文章：删除、隐藏、取消隐藏。只接受六位文章ID，并同步KV索引。
  if("manage"==paths[1]){
    let ret={};
    try{
      ret=await request.json();
    }catch(e){
      ret={};
    }
    // 直接解析本接口的 JSON 请求，避免通用表单解析器对数组字段做转换。
    const ids=Array.isArray(ret.ids)?[...new Set(ret.ids.map(v=>String(v).trim()).filter(Boolean))]:[];
    const action=String(ret.action||"").trim();
    if(!ids.length || ids.length>100 || !["delete","hide","unhide","top","untop"].includes(action)){
      json=JSON.stringify({msg:"操作参数无效：请确认已选择文章且操作类型正确",rst:false});
    }else{
      const all=await getAllArticlesList();
      const existingIds=new Set(all.map(item=>String(item.id)));
      const validIds=ids.filter(id=>existingIds.has(id));
      if(!validIds.length){
        json=JSON.stringify({msg:"所选文章不存在或列表数据已过期，请刷新页面后重试",rst:false});
      }else{
      const wanted=new Set(validIds);
      let changed=0;
      for(let i=all.length-1;i>=0;i--){
        const item=all[i];
        if(!wanted.has(String(item.id))) continue;
        if(action==="delete"){
          await CFBLOG.delete(String(item.id));
          all.splice(i,1);
          changed++;
        }else{
          const article=await getArticle(String(item.id));
          if(!article) continue;
          if(action==="hide" || action==="unhide"){
            article.hidden=action==="hide"?1:0;
            item.hidden=article.hidden;
          }else{
            article.top_timestamp=action==="top"?(Date.now()+8*60*60*1000):0;
            item.top_timestamp=article.top_timestamp;
          }
          await saveArticle(String(item.id),JSON.stringify(article));
          changed++;
        }
      }
      if(changed){
        await saveArticlesList(JSON.stringify(all));
        if(action==="hide" || action==="unhide"){
          const tags=[...new Set(all.filter(a=>a.status!=="draft"&&a.status!=="scheduled"&&!a.hidden).flatMap(a=>Array.isArray(a.tags)?a.tags:[]).filter(Boolean))];
          await saveWidgetTags(JSON.stringify(tags));
        }
      }
      json=JSON.stringify({msg:changed+"篇文章已"+(action==="delete"?"删除":action==="hide"?"隐藏":action==="unhide"?"取消隐藏":action==="top"?"置顶":"取消置顶"),rst:true,changed});
      }
    }
  }

  //保存编辑的文章
  if("saveEdit"==paths[1]){
    const ret=await parseReq(request);
    let title=String(ret.title||""),//文章标题
        img=String(ret.img||""),//插图
        link=String(ret.link||""),//永久链接
        createDate=String(ret.createDate||"").replace('T',' '),//发布日期
        category=Array.isArray(ret.category)?ret.category:(ret.category?[ret.category]:[]),//分类
        tags=Array.isArray(ret.tags)?ret.tags:(ret.tags?[ret.tags]:[]),//标签
        priority=void 0===ret.priority?"0.5":ret.priority,//权重
        changefreq=void 0===ret.changefreq?"daily":ret.changefreq,//更新频率
        contentMD=String(ret["content-markdown-doc"]||""),//文章内容-md格式
        contentHtml=String(ret["content-html-code"]||""),//文章内容-html格式
        contentText="",//文章摘要
        top_timestamp=Number(ret.top_timestamp)||0,//置顶时间戳
        modify_timestamp=Date.now()+8*60*60*1000,//修改时间戳
        hidden=Number(ret.hidden)||0,//是否隐藏
        status=["draft","scheduled"].includes(ret.status)?ret.status:"published",
        scheduledAt=String(ret.scheduledAt||""),
        id=String(ret.id||"");//文章id

    // 富文本编辑器可能只提交 HTML 或纯文本其中一个字段；发布前补齐另一种格式。
    if(!contentHtml.trim() && contentMD.trim()){
      contentHtml=contentMD.split(/\r?\n/).map(line=>line.trim()?"<p>"+line.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")+"</p>":"").join("");
    }
    if(!contentMD.trim() && contentHtml.trim()){
      contentMD=contentHtml.replace(/<br\s*\/?\s*>/gi,"\n").replace(/<\/(p|div|h[1-6]|li)>/gi,"\n").replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").trim();
    }
        
    //校验参数完整性
    const scheduleTime=Date.parse(scheduledAt);
    if(id && /^\d{6}$/.test(id) && title.length>0 && title.length<=300
      && img.length<=2048 && link.length<=200
      && contentMD.length<=1000000 && contentHtml.length<=1000000
      && category.length<=30 && tags.length<=50
      && (status==="draft" || (createDate.trim().length>0 && contentHtml.trim().length>0))
      && (status!=="scheduled" || (Number.isFinite(scheduleTime) && scheduleTime>Date.now()))
      && await getArticle(id)){
          
      contentText=contentHtml.replace(/<\/?[^>]*>/g,"").trim().substring(0,OPT.readMoreLength);//摘要
      //组装文章json
      let article={
        id:id,
        title:title,
        img:img,
        link:link,
        createDate:createDate,
        category:category,
        tags:tags,
        contentMD:contentMD,
        contentHtml:contentHtml,
        contentText:contentText,
        priority:priority,
        top_timestamp:top_timestamp,
        modify_timestamp:modify_timestamp,
        hidden:hidden,
        status:status,
        scheduledAt:scheduledAt,
        changefreq:changefreq
      };
      
      //将文章json写入KV（key为文章id，value为文章json字符串）
      await saveArticle(id,JSON.stringify(article));
      
      //组装文章json
      let articleWithoutHtml={
        id:id,
        title:title,
        img:img,
        link:link,
        createDate:createDate,
        category:category,
        tags:tags,
        contentText:contentText,
        priority:priority,
        top_timestamp:top_timestamp,
        modify_timestamp:modify_timestamp,
        hidden:hidden,
        status:status,
        scheduledAt:scheduledAt,
        changefreq:changefreq
      },
      articles_all=await getAllArticlesList();//读取文章列表
      //console.log(articles_all)
      //将原对象删掉，将最新的文章加入文章列表中，并重新按id排序后，再次回写到KV中
      for(var i=articles_all.length-1;i>=0;i--){//按索引删除，要倒序，否则索引值会变
        if(articles_all[i].id == id){
          articles_all.splice(i,1);
          break;
        }
      }
      articles_all.push(articleWithoutHtml),
      articles_all=sortArticle(articles_all),
      await saveArticlesList(JSON.stringify(articles_all))
      json = '{"msg":"Edit OK","rst":true,"id":"'+id+'"}'
    }else{
      const missing=[];
      if(!id || !/^\d{6}$/.test(id)) missing.push("文章ID无效");
      if(!title.trim() || title.length>300) missing.push("标题为空或超过300字符");
      if(img.length>2048) missing.push("特色图片地址超过2048字符");
      if(link.length>200) missing.push("永久链接超过200字符");
      if(category.length>30) missing.push("分类数量超过30");
      if(tags.length>50) missing.push("标签数量超过50");
      if(contentMD.length>1000000 || contentHtml.length>1000000) missing.push("正文超过1MB");
      if(status!=="draft" && !createDate.trim()) missing.push("创建日期为空");
      if(status!=="draft" && !contentHtml.trim()) missing.push("正文为空（富文本 HTML 未同步）");
      if(status==="scheduled" && !(Number.isFinite(scheduleTime) && scheduleTime>Date.now())) missing.push("定时发布时间无效或已过期");
      if(id && /^\d{6}$/.test(id) && !await getArticle(id)) missing.push("找不到要编辑的文章");
      json=JSON.stringify({msg:"保存失败："+(missing.join("；")||"字段校验未通过，请检查表单数据"),rst:false});
    }
  }
  
  //返回结果
  if(!json &&!html && !file){
    json = '{"msg":"some errors","rst":false}'
  }
  if(file){
    return new Response(file.content,{
      headers:{
        "content-type":"application/octet-stream;charset=utf-8",
        "Content-Disposition":"attachment; filename="+file.name
      },
      status:200
    })
  }
  if(html){
    return new Response(html,{
      headers:{
        "content-type":"text/html;charset=UTF-8"
      },
      status:200
    })
  }
  if(json){
    return new Response(json ,{
      headers:{
        "content-type":"application/json;charset=UTF-8"
      },
      status:200
    })
  }
}

/**------【④.抽丝剥茧，抽取公用的业务方法】-----**/

//访问管理后台或私密博客，则进行Base Auth
function parseBasicAuth(request, env){
    const auth=request.headers.get("Authorization");

    // 仅允许配置了独立 token 后，通过 token 导出公开的搜索索引和站点地图。
    if(!auth||!/^Basic [A-Za-z0-9._~+/-]+=*$/i.test(auth)){
        const token = request.headers.get("cfblog_token");
        if(token && ACCOUNT.third_token){
            const url=new URL(request.url);
            const paths=url.pathname.trim("/").split("/");
            if("admin"===paths[0] && ("search.xml"===paths[1] || "sitemap.xml"===paths[1])){
                return token === ACCOUNT.third_token && !String(ACCOUNT.third_token).startsWith("CHANGE_ME_");
            }
        }
        return false;
    }

    // Basic Auth 的密码可能包含冒号；只在第一个冒号处分隔用户名和密码。
    try{
        const decoded=atob(auth.split(" ").pop());
        const separator=decoded.indexOf(":");
        if(separator<0) return false;
        const user=decoded.slice(0,separator);
        const pwd=decoded.slice(separator+1);
        // 不要记录用户名/密码，避免凭据进入 Workers 日志。
        // 拒绝仓库示例凭据及空凭据，避免新部署沿用公开默认密码。
        const configuredUser=String(env.CFBLOG_ADMIN_USER||"");
        const configuredPassword=String(env.CFBLOG_ADMIN_PASSWORD||"");
        if(!configuredUser || !configuredPassword ||
           configuredUser.startsWith("CHANGE_ME_") ||
           configuredPassword.startsWith("CHANGE_ME_")) return false;
        return user===configuredUser && pwd===configuredPassword;
    }catch(error){
        return false;
    }
}

//获取所有【公开】文章：仅前台使用
async function getArticlesList(){
  let articles_all = await getAllArticlesList(),
      now=Date.now();
  //旧文章没有 status 字段，默认视为已发布；草稿和未到时间的定时文章不公开。
  return articles_all.filter(article=>{
    if(article.status==="draft") return false;
    if(article.status==="scheduled"){
      const publishAt=Date.parse(String(article.scheduledAt||"").replace(" ","T"));
      if(!Number.isFinite(publishAt)||publishAt>now) return false;
    }
    return !article.hidden;
  });
}

//文章排序：先按id倒排，再按置顶时间倒排
function sortArticle(articles){
  return sort(sort(articles,'id'),'top_timestamp');
}

//获取近期文章列表
async function getRecentlyArticles(articles){
  if(!articles){
    articles = await getArticlesList();
  }
  if(OPT.recentlyType == 2){//按修改时间倒序
    articles = sort([].concat(articles),'modify_timestamp');
  }
  let articles_recently = articles.slice(0,OPT.recentlySize);

  for(var i=0;i<articles_recently.length;i++){
      //调整文章的日期(yyyy-MM-dd)和url
      if(articles_recently[i].top_timestamp && !articles_recently[i].title.startsWith(OPT.top_flag)){
        articles_recently[i].title = OPT.top_flag + articles_recently[i].title
      }
      articles_recently[i].createDate10=String(articles_recently[i].createDate||"").substr(0,10),
      articles_recently[i].url="/article/"+articles_recently[i].id+"/"+articles_recently[i].link+".html";
  }
  return articles_recently;
}

//处理文章的属性信息：日期(yyyy-MM-dd)、年、月、日、内容长度和url
function processArticleProp(articles){
    for(var i=0;i<articles.length;i++){
        //调整文章的日期(yyyy-MM-dd)、文章长度和url
        if(articles[i]){
            if(articles[i].top_timestamp && !articles[i].title.startsWith(OPT.top_flag)){
              articles[i].title = OPT.top_flag + articles[i].title
            }
            //调整文章的日期(yyyy-MM-dd)、年、月、日、内容长度和url
            articles[i].createDate10=String(articles[i].createDate||"").substr(0,10),
            articles[i].createDateYear=String(articles[i].createDate||"").substr(0,4),
            articles[i].createDateMonth=String(articles[i].createDate||"").substr(5,7),
            articles[i].createDateDay=String(articles[i].createDate||"").substr(8,10),
            articles[i].contentLength=String(articles[i].contentText||"").length,
            articles[i].url="/article/"+articles[i].id+"/"+articles[i].link+".html";
        }
    }
}

// 极简博客首页：纯 HTML/CSS/原生 JS，不依赖额外前端框架。
function minimalIndexTemplate(){
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{{OPT.siteDescription}}">
<meta name="keywords" content="{{keyWords}}">
<title>{{title}}</title>
<style>
:root{--bg:#fff;--fg:#242424;--muted:#858585;--line:#ececec;--soft:#f7f7f7;--accent:#333;--width:760px}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.85 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}a:hover{color:#777}.site{width:min(var(--width),calc(100% - 44px));margin:0 auto}.topbar{height:88px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line)}
.brand{font-size:25px;font-weight:700;letter-spacing:-.7px}.brand small{display:block;font-size:10px;letter-spacing:2px;color:var(--muted);font-weight:500;line-height:1.2}
.menu-button{width:42px;height:42px;border:1px solid var(--line);background:#fff;border-radius:50%;display:grid;place-content:center;gap:5px;cursor:pointer}.menu-button span{display:block;width:16px;height:1.5px;background:#333}
.intro{padding:48px 0 35px;border-bottom:1px solid var(--line)}.eyebrow{font-size:11px;letter-spacing:2px;color:var(--muted);text-transform:uppercase}.intro p{font-size:15px;color:#666;max-width:590px;margin:12px 0 0;line-height:2}
.search{display:flex;align-items:center;gap:10px;margin-top:24px;max-width:440px;border-bottom:1px solid #dcdcdc;padding:7px 0}.search input{border:0;outline:0;flex:1;min-width:0;font:inherit;font-size:14px;background:transparent}.search button{border:0;background:none;color:#777;cursor:pointer;font-size:13px}
main{padding:12px 0 8px}.section-label{font-size:11px;letter-spacing:2px;color:var(--muted);margin:26px 0 8px}.post{padding:25px 0 27px;border-bottom:1px solid var(--line)}.post-meta{font-size:12px;color:#999;letter-spacing:.4px}.post h2{font-size:21px;line-height:1.5;font-weight:650;letter-spacing:-.3px;margin:7px 0 8px}.post-excerpt{color:#777;font-size:14px;line-height:1.9;margin:0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.post-bottom{display:flex;align-items:center;gap:12px;margin-top:12px;font-size:12px;color:#999}.readmore{color:#555}
.pagination{display:flex;justify-content:center;align-items:center;gap:20px;padding:34px 0 40px;font-size:13px}.pagination a{border:1px solid var(--line);padding:7px 15px;border-radius:3px}.pagination .current{color:#999}
.stats{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:23px 0;display:flex;gap:45px;flex-wrap:wrap}.stat strong{font-size:21px;font-weight:600;display:block;line-height:1.4}.stat span{font-size:11px;letter-spacing:1px;color:var(--muted)}
footer{padding:30px 0 42px;color:#999;font-size:12px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}.footer-copy a{text-decoration:underline;text-underline-offset:3px}
.drawer-mask{position:fixed;inset:0;background:rgba(0,0,0,.28);opacity:0;visibility:hidden;transition:.25s;z-index:9}.drawer{position:fixed;z-index:10;right:0;top:0;height:100%;width:min(360px,88vw);background:#fff;padding:26px 28px;overflow:auto;transform:translateX(102%);transition:transform .28s ease;box-shadow:-8px 0 35px rgba(0,0,0,.06)}body.drawer-open .drawer{transform:translateX(0)}body.drawer-open .drawer-mask{opacity:1;visibility:visible}.drawer-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:18px;border-bottom:1px solid var(--line);font-size:17px;font-weight:650}.drawer-close{border:0;background:none;font-size:25px;cursor:pointer;color:#777}.drawer-section{padding:20px 0 6px;border-bottom:1px solid var(--line)}.drawer-section h3{font-size:11px;color:#999;letter-spacing:1.5px;font-weight:500;margin:0 0 12px}.drawer-list{display:flex;flex-wrap:wrap;gap:8px 14px;font-size:13px;color:#555;padding-bottom:15px}.drawer-list a{display:inline-block}.drawer-list.archive{display:block}.drawer-list.archive a{display:flex;justify-content:space-between;padding:4px 0}
.search-results{display:none;padding:15px 0 8px;border-bottom:1px solid var(--line)}.search-results.show{display:block}.search-results h3{font-size:12px;color:#888;font-weight:500}.search-results a{display:block;padding:8px 0;font-size:14px;border-top:1px solid #f1f1f1}.search-results small{display:block;color:#999;font-size:11px}
.empty{padding:42px 0;color:#999;text-align:center;font-size:14px}
@media(max-width:600px){.site{width:calc(100% - 36px)}.topbar{height:72px}.brand{font-size:22px}.intro{padding:35px 0 27px}.post{padding:21px 0}.post h2{font-size:19px}.stats{gap:25px}.stats .stat strong{font-size:19px}footer{display:block}footer span{display:block;margin-top:5px}}
</style>
</head>
<body>
<div class="site">
<header class="topbar">
<a class="brand" href="/">{{OPT.siteName}}<small>PERSONAL NOTES & WRITINGS</small></a>
<button class="menu-button" id="menuOpen" aria-label="打开菜单" aria-expanded="false"><span></span><span></span><span></span></button>
</header>
<section class="intro">
<div class="eyebrow">A LITTLE ABOUT ME</div>
<p>{{OPT.siteIntro}}</p>
<form class="search" id="siteSearch" role="search"><input id="searchInput" type="search" placeholder="搜索文章标题或内容…" autocomplete="off"><button type="submit">搜索 ↗</button></form>
<div class="search-results" id="searchResults" aria-live="polite"></div>
</section>
<main>
<div class="section-label">{{#isArchive}}ARCHIVE{{/isArchive}}{{^isArchive}}LATEST WRITINGS{{/isArchive}}</div>
{{#articleList}}
<article class="post">
<div class="post-meta">{{createDate10}}　·　{{contentLength}} 字</div>
<h2><a href="{{url}}">{{title}}</a></h2>
<p class="post-excerpt">{{contentText}}</p>
<div class="post-bottom"><span>{{#category}}{{.}}　{{/category}}</span><a class="readmore" href="{{url}}">继续阅读 →</a></div>
</article>
{{/articleList}}
{{^articleList}}<div class="empty">这里还没有文章。</div>{{/articleList}}
<nav class="pagination" aria-label="文章分页">
{{#pageNewer}}<a href="{{url}}">← 上一页</a>{{/pageNewer}}
<span class="current">第 {{pageNo}} 页</span>
{{#pageOlder}}<a href="{{url}}">下一页 →</a>{{/pageOlder}}
</nav>
<section class="stats">
<div class="stat"><strong>{{blogArticleCount}}</strong><span>篇文章</span></div>
<div class="stat"><strong>{{blogWordCount}}</strong><span>累计字数</span></div>
<div class="stat"><strong>{{blogYearCount}}</strong><span>记录年份</span></div>
</section>
</main>
<footer><div class="footer-copy">{{{OPT.copyRight}}}</div><span>用文字记录生活 · © {{currentYear}}</span></footer>
</div>
<div class="drawer-mask" id="drawerMask"></div>
<aside class="drawer" id="siteDrawer" aria-hidden="true">
<div class="drawer-head"><span>探索博客</span><button class="drawer-close" id="menuClose" aria-label="关闭菜单">×</button></div>
<section class="drawer-section"><h3>博客存档</h3><div class="drawer-list archive">{{#archiveList}}<a href="/?year={{year}}"><span>{{year}}</span><span>{{count}} 篇</span></a>{{/archiveList}}</div></section>
<section class="drawer-section"><h3>分类</h3><div class="drawer-list">{{#categoryItems}}<a href="{{url}}">{{name}}</a>{{/categoryItems}}</div></section>
<section class="drawer-section"><h3>标签</h3><div class="drawer-list">{{#tagItems}}<a href="{{url}}"># {{name}}</a>{{/tagItems}}</div></section>
<section class="drawer-section"><h3>站点链接</h3><div class="drawer-list">{{#linkItems}}<a href="{{url}}" target="_blank" rel="noopener noreferrer">{{name}}</a>{{/linkItems}}</div></section>
</aside>
<script>
(function(){
 const body=document.body,open=document.getElementById('menuOpen'),close=document.getElementById('menuClose'),mask=document.getElementById('drawerMask'),drawer=document.getElementById('siteDrawer');
 function setDrawer(value){body.classList.toggle('drawer-open',value);open.setAttribute('aria-expanded',String(value));drawer.setAttribute('aria-hidden',String(!value));}
 open.addEventListener('click',()=>setDrawer(true));close.addEventListener('click',()=>setDrawer(false));mask.addEventListener('click',()=>setDrawer(false));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')setDrawer(false)});
 const form=document.getElementById('siteSearch'),input=document.getElementById('searchInput'),results=document.getElementById('searchResults');
 let searchData=null;
 form.addEventListener('submit',async function(e){
  e.preventDefault();const q=input.value.trim().toLowerCase();results.classList.add('show');results.innerHTML='';
  if(!q){results.textContent='请输入搜索关键词';return;}
  results.innerHTML='<h3>正在搜索…</h3>';
  try{
   if(!searchData){const response=await fetch('/search.xml',{credentials:'same-origin'});if(!response.ok)throw new Error('search unavailable');const xml=new DOMParser().parseFromString(await response.text(),'application/xml');searchData=Array.from(xml.querySelectorAll('blog')).map(node=>({title:node.querySelector('title')?.textContent||'',url:node.querySelector('url')?.textContent||'#',content:node.querySelector('content')?.textContent||'',time:node.querySelector('time')?.textContent||''}));}
   const matches=searchData.filter(item=>(item.title+' '+item.content).toLowerCase().includes(q)).slice(0,20);
   results.innerHTML='<h3>搜索结果：'+matches.length+' 条</h3>';
   if(!matches.length){results.insertAdjacentHTML('beforeend','<p class="post-excerpt">没有找到相关文章。</p>');return;}
   matches.forEach(item=>{const a=document.createElement('a'),small=document.createElement('small');a.href=item.url;a.textContent=item.title;small.textContent=item.time;a.appendChild(small);results.appendChild(a);});
  }catch(err){results.textContent='搜索暂不可用，请稍后再试。';searchData=null;}
 });
})();
</script>
</body></html>`;
}

//按文章正文统计总字数：中文按字符计，英文按单词计。
async function getBlogWordCount(articles){
  let total=0;
  for(let i=0;i<articles.length;i+=20){
    const batch=await Promise.all(articles.slice(i,i+20).map(item=>getArticle(item.id)));
    for(const article of batch){
      if(!article) continue;
      const textContent=String(article.contentMD||article.contentHtml||"").replace(/<[^>]*>/g," ").replace(/&[a-z#0-9]+;/gi," ");
      const cjk=(textContent.match(/[\u3400-\u9fff]/g)||[]).length;
      const latin=(textContent.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)||[]).length;
      total+=cjk+latin;
    }
  }
  return total;
}

//获取前台模板源码, template_path:模板的相对路径
async function getSavedBlogSettings(){
  try{const value=await CFBLOG.get("SYSTEM_BLOG_SETTINGS");return value?JSON.parse(value):{};}catch(e){return {};}
}
async function applySavedBlogSettings(){
  const saved=await getSavedBlogSettings();
  for(const key of ["siteName","siteDescription","siteIntro"]){if(typeof saved[key]==="string") OPT[key]=saved[key];}
}

async function getThemeHtml(template_path){
  template_path=template_path.replace(".html","")
  if(template_path==="index") return minimalIndexTemplate();
  let html = await (await fetch(OPT.themeURL+template_path+".html",{cf:{cacheTtl:600}})).text();
  
  // 新建文章时分类为可选项；移除旧版主题仍强制要求分类及检查不存在的 WidgetMenu 的前端校验。
  if(template_path==="admin/index"){
    html=html.replace('onclick="saveAddNew()">保存</a>','onclick="saveAddNew()">立即发布</a>');
    html=html.replace("|| $('#category').val() == \"\" || $('#category').val() == null","");
    html=html.replace("$('#WidgetMenu').val() == \"\" || $('#WidgetMenu').val() == null\n            || ","");
    html=html.replace("分类<span style=\"color: red;\">*</span>","分类");
    // 草稿允许不填写发布日期；原主题的 saveAddNew 校验会在发请求前拦截无日期草稿。
    html=html.replace("|| $('#createDate').val() == \"\" || $('#createDate').val() == null","|| ($('#cfblog-status').val() !== \"draft\" && ($('#createDate').val() == \"\" || $('#createDate').val() == null))");
    // 后台文章列表增加管理操作列，编辑/删除均针对当前行的真实 ID。
    html=html.replace("tableContent += '<tr><td>'+Info.id+'</td><td><a href=\"/admin/edit/'+Info.id+'/\">'+Info.title+'</a></td><td>'+Info.createDate.replace(\"T\",\"\")+'</td></tr>';","tableContent += '<tr><td><input type=\"checkbox\" class=\"cfblog-row-select\" value=\"'+Info.id+'\"></td><td>'+Info.id+'</td><td><a href=\"/admin/edit/'+Info.id+'/\">'+Info.title+'</a></td><td>'+(Info.createDate||\"\").replace(\"T\",\"\")+'</td><td><button class=\"btn btn-xs btn-warning\" type=\"button\" onclick=\"cfblogManageOne(\\''+Info.id+'\\',\\''+(Info.top_timestamp?'untop':'top')+'\\')\">'+(Info.top_timestamp?'取消置顶':'置顶')+'</button> <button class=\"btn btn-xs btn-default\" type=\"button\" onclick=\"cfblogManageOne(\\''+Info.id+'\\',\\'hide\\')\">隐藏</button> <button class=\"btn btn-xs btn-danger\" type=\"button\" onclick=\"cfblogManageOne(\\''+Info.id+'\\',\\'delete\\')\">删除</button></td></tr>';");
    html=html.replace('<tr><td>ID</td><td>标题</td><td>创建日期</td></tr>','<tr><td><input type="checkbox" id="cfblog-select-all"></td><td>ID</td><td>标题</td><td>创建日期</td><td>管理</td></tr>');
    html=html.replace('<table class="table  table-striped" id="articleList">','<div class="btn-toolbar" style="margin:10px 0"><button type="button" class="btn btn-default btn-sm" onclick="cfblogSelectAll(true)">全选</button> <button type="button" class="btn btn-default btn-sm" onclick="cfblogSelectAll(false)">取消全选</button> <button type="button" class="btn btn-warning btn-sm" onclick="cfblogManageSelected(\'hide\')">隐藏所选</button> <button type="button" class="btn btn-info btn-sm" onclick="cfblogManageSelected(\'unhide\')">取消隐藏</button> <button type="button" class="btn btn-danger btn-sm" onclick="cfblogManageSelected(\'delete\')">删除所选</button></div><table class="table  table-striped" id="articleList">');
    const articleManagement='<script>window.cfblogSelectAll=function(v){document.querySelectorAll(".cfblog-row-select").forEach(function(x){x.checked=!!v;});var h=document.getElementById("cfblog-select-all");if(h)h.checked=!!v;};window.cfblogManageOne=function(id,action){if(action==="delete"&&!confirm("确定永久删除文章 "+id+" 吗？"))return;if(action==="hide"&&!confirm("确定隐藏文章 "+id+" 吗？"))return;cfblogManage([id],action);};window.cfblogManageSelected=function(action){var ids=Array.from(document.querySelectorAll(".cfblog-row-select:checked")).map(function(x){return x.value;});if(!ids.length){alert("请先勾选文章");return;}if(action==="delete"&&!confirm("确定永久删除选中的 "+ids.length+" 篇文章吗？"))return;if(action==="hide"&&!confirm("确定隐藏选中的 "+ids.length+" 篇文章吗？"))return;cfblogManage(ids,action);};window.cfblogManage=function(ids,action){fetch("/admin/manage/",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids:ids,action:action})}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json();}).then(function(x){alert(x.msg||"操作完成");if(x.rst)location.reload();}).catch(function(){alert("操作失败，请检查后台登录状态后重试");});};document.addEventListener("change",function(e){if(e.target&&e.target.id==="cfblog-select-all")cfblogSelectAll(e.target.checked);});</script>';
    html=html.includes("</body>")?html.replace("</body>",articleManagement+"</body>"):html+articleManagement;

  }

  if(template_path==="admin/edit"){
    const originalActions='<a tabindex="0"  role="button"  type="submit" id="btn_saveEdit" class="btn btn-default" onclick="saveEdit()">保存</a>\n\t\t\t\t<a  type="submit" role="button" id="btn_delete" class="btn btn-warning" onclick="deleteArticle()">删除</a>';
    const workflowActions='<div id="cfblog-edit-actions" class="form-group" style="width:100%;margin:12px 0;display:flex;gap:8px;flex-wrap:wrap"><button type="button" id="btn_saveEdit" class="btn btn-default" onclick="saveEdit()">按当前状态保存</button> <button type="button" class="btn btn-info" onclick="cfblogSaveEditAs(\'draft\')">保存为草稿</button> <button type="button" class="btn btn-success" onclick="cfblogSaveEditAs(\'published\')">立即发布</button> <button type="button" class="btn btn-primary" onclick="cfblogSaveEditAs(\'scheduled\')">定时发布</button> <button type="button" id="btn_delete" class="btn btn-warning" onclick="deleteArticle()">删除</button></div>';
    html=html.replace(originalActions,workflowActions);
  }

  // 独立可视化文字编辑器：直接替换正文容器，不依赖异步挂载。
  if(template_path==="admin/index" || template_path==="admin/edit"){
    html=html.replace(/<link\b[^>]*editormd[^>]*>/gi,"");
    html=html.replace(/<script\b[^>]*editormd[^>]*><\/script>/gi,"");
    html=html.replace(/var mdEditor\s*=\s*editormd\("content",\s*\{[\s\S]*?\n\s*\}\);/,"");
    if(template_path==="admin/edit") html=html.replace(/var articleJson\s*=\s*(<!--\{articleJson\}-->);/,"var articleJson = $1; window.articleJson=articleJson; window.cfblogInitialHtml = articleJson.contentHtml || articleJson.contentMD || '';");
    const editorMarkup = '<section id="cfblog-editor" style="border:1px solid #ccc;background:#fff;margin:12px 0;width:100%;">' +
      '<div id="cfblog-editor-toolbar" style="display:flex;flex-wrap:wrap;gap:6px;padding:8px;background:#f5f5f5;border-bottom:1px solid #ddd;">' +
      '<button type="button" data-cmd="undo">撤销</button><button type="button" data-cmd="redo">重做</button><button type="button" data-cmd="bold"><b>加粗</b></button><button type="button" data-cmd="italic"><i>斜体</i></button><button type="button" data-cmd="underline"><u>下划线</u></button>' +
      '<button type="button" data-block="h2">标题</button><button type="button" data-block="p">正文</button><button type="button" data-cmd="insertUnorderedList">项目列表</button><button type="button" data-cmd="insertOrderedList">编号列表</button>' +
      '<button type="button" data-cmd="justifyLeft">左对齐</button><button type="button" data-cmd="justifyCenter">居中</button><button type="button" data-cmd="justifyRight">右对齐</button><button type="button" data-action="link">插入链接</button><button type="button" data-action="image">插入图片</button><button type="button" data-action="quote">引用</button><button type="button" data-action="clear">清除格式</button></div>' +
      '<div id="cfblog-editor-area" contenteditable="true" role="textbox" aria-label="文章正文" aria-multiline="true" style="min-height:480px;padding:14px;outline:none;font:16px/1.8 Arial,Microsoft YaHei,sans-serif;overflow-wrap:anywhere;"><p><br></p></div></section>' +
      '<textarea id="cfblog-content-md" name="content-markdown-doc" style="display:none"></textarea><textarea id="cfblog-content-html" name="content-html-code" style="display:none"></textarea>';
    const oldContent = /<div\s+id="content">\s*<textarea[^>]*><\/textarea>\s*<\/div>/i;
    if(!oldContent.test(html)) throw new Error("未找到主题正文容器 #content，停止输出不完整编辑页面");
    html=html.replace(oldContent,editorMarkup);
    const editorBehavior = '<script>(function(){function init(){' +
      'var area=document.getElementById("cfblog-editor-area"),toolbar=document.getElementById("cfblog-editor-toolbar"),form=document.getElementById("addNewForm")||document.getElementById("editForm"),md=document.getElementById("cfblog-content-md"),hf=document.getElementById("cfblog-content-html");' +
      'if(!area||!toolbar||!form||!md||!hf)return;var initial=window.cfblogInitialHtml||"";if(!initial&&typeof articleJson!=="undefined"&&articleJson)initial=articleJson.contentHtml||articleJson.contentMD||"";if(location.pathname.startsWith("/admin/edit/")){var article=window.articleJson||(typeof articleJson!=="undefined"?articleJson:null)||{};var idField=form.querySelector("input[name=id]");if(!idField){idField=document.createElement("input");idField.type="hidden";idField.name="id";form.appendChild(idField);}idField.value=String(article.id||"");}if(initial){if(/<\\/?[a-z][\\s\\S]*>/i.test(initial))area.innerHTML=initial;else area.textContent=initial;}' +
      'function sync(){hf.value=area.innerHTML;md.value=area.innerText||area.textContent||"";}' +
      'toolbar.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;area.focus();if(b.dataset.cmd)document.execCommand(b.dataset.cmd,false,null);else if(b.dataset.block)document.execCommand("formatBlock",false,b.dataset.block);else if(b.dataset.action==="link"){var u=prompt("请输入链接地址");if(u)document.execCommand("createLink",false,u);}else if(b.dataset.action==="image"){var u=prompt("请输入图片地址");if(u)document.execCommand("insertImage",false,u);}else if(b.dataset.action==="quote")document.execCommand("formatBlock",false,"blockquote");else if(b.dataset.action==="clear")document.execCommand("removeFormat",false,null);sync();});' +
      'area.addEventListener("input",sync);form.addEventListener("submit",sync,true);document.addEventListener("click",function(e){if(e.target.closest("#btn_saveAddNew,#btn_saveEdit"))sync();},true);sync();}' +
      'if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();})();</script>';
    html=html.includes("</body>")?html.replace("</body>",editorBehavior+"</body>"):html+editorBehavior;
    if(template_path==="admin/edit"){
      const reliableEditSave = '<script>(function(){window.saveEdit=function(){var form=document.getElementById("editForm"),area=document.getElementById("cfblog-editor-area"),md=document.getElementById("cfblog-content-md"),hf=document.getElementById("cfblog-content-html");if(area&&md&&hf){hf.value=area.innerHTML;md.value=area.innerText||area.textContent||"";}var article=window.articleJson||{},id=String(article.id||document.querySelector("#editForm input[name=id]")?.value||"");var payload=window.jQuery("#editForm").serializeArray().filter(function(item){return item.name!=="id";});payload.push({name:"id",value:id});window.jQuery.ajax({type:"POST",dataType:"json",contentType:"application/json; charset=utf-8",url:"/admin/saveEdit/",data:JSON.stringify(payload),success:function(result){alert(result.msg);},error:function(xhr){alert("保存请求失败："+xhr.status);}});};})();</script>';
      html=html.includes("</body>")?html.replace("</body>",reliableEditSave+"</body>"):html+reliableEditSave;
    }
  }
  if(template_path==="admin/edit"){
    const editWorkflowActions='<script>(function(){window.cfblogSaveEditAs=function(status){var selector=document.getElementById("cfblog-status");if(!selector){alert("文章状态控件尚未加载，请刷新页面后重试");return;}selector.value=status;selector.dispatchEvent(new Event("change",{bubbles:true}));if(status==="scheduled"){var date=document.getElementById("cfblog-scheduled-at");if(!date||!date.value){alert("请先选择计划发布时间");if(date)date.focus();return;}if(new Date(date.value).getTime()<=Date.now()){alert("计划发布时间必须晚于当前时间");date.focus();return;}}if(typeof window.saveEdit==="function")window.saveEdit();};})();</script>';
    html=html.includes("</body>")?html.replace("</body>",editWorkflowActions+"</body>"):html+editWorkflowActions;
  }
  if("admin/index"===template_path){
    const workflowDashboard = `
      <script>
      (function(){
        function mountWorkflowPanel(){
          if(document.getElementById("cfblog-workflow-panel")) return;
          const panel=document.createElement("section");
          panel.id="cfblog-workflow-panel";
          panel.className="panel panel-default";
          panel.style.margin="20px 0";
          panel.innerHTML='<div class="panel-heading"><strong>内容管理</strong> <button type="button" class="btn btn-xs btn-default" id="cfblog-workflow-refresh" style="float:right">刷新</button></div><div class="panel-body"><div class="row"><div class="col-sm-6"><h4>草稿箱 <span class="badge" id="cfblog-draft-count">0</span></h4><ul id="cfblog-draft-list" class="list-unstyled"><li>加载中…</li></ul></div><div class="col-sm-6"><h4>定时发布 <span class="badge" id="cfblog-scheduled-count">0</span></h4><ul id="cfblog-scheduled-list" class="list-unstyled"><li>加载中…</li></ul></div></div></div>';
          const target=document.querySelector(".tab-content")||document.querySelector("#myTab")||document.querySelector(".container")||document.body;
          target.parentNode.insertBefore(panel,target.nextSibling);
          async function load(){
            for(const type of ["Drafts","Scheduled"]){
              const key=type==="Drafts"?"draft":"scheduled",list=document.getElementById("cfblog-"+key+"-list"),count=document.getElementById("cfblog-"+key+"-count");
              try{
                const response=await fetch("/admin/get"+type,{credentials:"same-origin",cache:"no-store"});
                if(!response.ok) throw new Error("HTTP "+response.status);
                const items=await response.json();
                count.textContent=items.length;
                list.innerHTML="";
                if(!items.length){list.innerHTML="<li>暂无内容</li>";continue;}
                items.forEach(item=>{
                  const li=document.createElement("li"),a=document.createElement("a"),meta=document.createElement("small");
                  a.href="/admin/edit/"+encodeURIComponent(item.id);a.textContent=item.title||("未命名文章 "+item.id);
                  meta.textContent=type==="Scheduled"?" · "+(item.scheduledAt?new Date(item.scheduledAt).toLocaleString():"未设置时间"):" · 草稿";
                  li.appendChild(a);li.appendChild(meta);list.appendChild(li);
                });
              }catch(error){list.textContent="加载失败，请刷新重试";}
            }
          }
          document.getElementById("cfblog-workflow-refresh").addEventListener("click",load);
          load();
        }
        if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",mountWorkflowPanel); else mountWorkflowPanel();
      })();
      </script>`;
    html=html.includes("</body>")?html.replace("</body>",workflowDashboard+"</body>"):html+workflowDashboard;
  }
  

  // 分类完全可选：服务端移除分类字段的必填约束和标签星号，客户端再兜底处理动态表单。
  if(template_path==="admin/index" || template_path==="admin/edit"){
    const optionalCategory = '<script>(function(){function relax(){' +
      'var forms=document.querySelectorAll("form");forms.forEach(function(form){' +
      'form.querySelectorAll("input,select,textarea").forEach(function(el){var key=((el.name||"")+" "+(el.id||"")).toLowerCase();var group=el.closest(".form-group,.form-item,.control-group");var text=group?group.textContent:"";if(key.indexOf("categor")>=0||text.indexOf("分类")>=0){el.required=false;el.removeAttribute("required");el.removeAttribute("aria-required");if(window.jQuery){try{window.jQuery(el).rules("remove","required");}catch(e){}}}});' +
      'form.querySelectorAll("label").forEach(function(label){if(label.textContent.indexOf("分类")>=0){var next=label.textContent.split("*").join("").replace("（可选）","")+"（可选）";if(label.textContent!==next)label.textContent=next;}});' +
      '});}' +
      'if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",relax);else relax();' +
      'if(window.MutationObserver)new MutationObserver(relax).observe(document.documentElement,{childList:true,subtree:true});})();</script>';
    html=html.includes("</body>")?html.replace("</body>",optionalCategory+"</body>"):html+optionalCategory;
  }

  // 后台扩展脚本此前只定义在 OPT.editor_page_scripts，却从未注入页面，导致草稿/定时发布、置顶/隐藏和默认日期控件均未生效。
  if(template_path==="admin/index" || template_path==="admin/edit"){
    const adminScripts='<script>'+OPT.editor_page_scripts+'</script>';
    html=html.includes("</body>")?html.replace("</body>",adminScripts+"</body>"):html+adminScripts;
  }

  return html
}

//根据文章id，返回上篇、下篇文章，文章内容页底部会用到
async function getSiblingArticle(id){
    id=("00000"+parseInt(id)).substr(-6);
    //读取文章列表，查找指定id的文章
    let articles_all=await getArticlesList(),
        article_idx=-1;
    for(var i=0,len=articles_all.length;i<len;i++)
      if(articles_all[i].id==id){
          article_idx=i;
          break
      }
    let value=await getArticle(id);
    return null==value||0===value.length?[void 0,void 0,void 0]:[articles_all[article_idx-1],value,articles_all[article_idx+1]]
}

//清除缓存
async function purge(cacheZoneId=ACCOUNT.cacheZoneId,cacheToken=ACCOUNT.cacheToken){
    if(null==cacheZoneId||null==cacheToken||cacheZoneId.length<5||cacheToken.length<5){
        return false;
    }
    let ret=await fetch(`https://api.cloudflare.com/client/v4/zones/${cacheZoneId}/purge_cache`,{
        method:"POST",
        headers:{
            "Authorization":"Bearer "+cacheToken,
            "Content-Type":"application/json"
        },
        body:'{"purge_everything":true}'
    });
    return (await ret.json()).success
}

//后台文章列表页的分页加载，返回[文章列表,是否无下一页]
async function admin_nextPage(pageNo,pageSize=OPT.pageSize){
    pageNo=pageNo<=1?1:pageNo;
    let articles_all=await getAllArticlesList(),
        articles=[];
    for(var i=(pageNo-1)*pageSize,s=Math.min(pageNo*pageSize,articles_all.length);i<s;i++){
      if(articles_all[i].top_timestamp && !articles_all[i].title.startsWith(OPT.top_flag)){
        articles_all[i].title = OPT.top_flag + articles_all[i].title
      }
      if(articles_all[i].hidden && !articles_all[i].title.startsWith(OPT.hidden_flag)){
        articles_all[i].title = OPT.hidden_flag + articles_all[i].title
      }
      if(articles_all[i].status==="draft") articles_all[i].title="[草稿] "+articles_all[i].title;
      if(articles_all[i].status==="scheduled") articles_all[i].title="[定时] "+articles_all[i].title;
      articles.push(articles_all[i]);
    }
    //articles=sortArticle(articles);
    return articles
}

//解析后台请求的参数
async function parseReq(request){
    const contentType=request.headers.get("content-type")||"";
    if(contentType.includes("application/json") || contentType.includes("form")){
        const payload=contentType.includes("application/json")?await request.json():await request.formData();
        const pairs=Array.isArray(payload)
            ? payload.map(item=>[item.name,item.value])
            : (payload instanceof FormData ? Array.from(payload.entries()) : Object.entries(payload));
        const settings={category:[],top_timestamp:0,hidden:0};
        for(const [name,value] of pairs){
            if(!name) continue;
            if(name==="tags"){
                settings.tags=Array.isArray(value)?value:(String(value||"").split(",").map(tag=>tag.trim()).filter(Boolean));
            }else if(String(name).toLowerCase().includes("category")){
                settings.category.push(...(Array.isArray(value)?value:[value]).filter(v=>v!==""&&v!=null));
            }else{
                settings[name]=value;
            }
        }
        return settings;
    }
    if(contentType.includes("application/text") || contentType.includes("text/html")){
        return await request.text();
    }
    const blob=await request.blob();
    return URL.createObjectURL(blob);
}

//为文章分配ID
async function generateId(){
    // SYSTEM_INDEX_NUM 旧逻辑通过 JSON.parse 读取数字，空值会变成 []，损坏值会变成 NaN。
    // 直接读取原始 KV，并以文章列表中的最大有效数字 ID 兜底，绝不生成 000NaN。
    const rawSeq=await CFBLOG.get("SYSTEM_INDEX_NUM");
    const parsedSeq=Number(rawSeq);
    const articles=await getAllArticlesList();
    let maxExisting=0;
    const used=new Set();
    for(const article of articles){
      const existing=String(article&&article.id||"");
      if(/^\d{6}$/.test(existing)){
        const n=Number(existing);
        if(Number.isSafeInteger(n) && n>maxExisting) maxExisting=n;
        used.add(existing);
      }
    }
    let next=Number.isSafeInteger(parsedSeq)&&parsedSeq>=0?Math.max(parsedSeq,maxExisting)+1:maxExisting+1;
    if(next<1) next=1;
    while(next<=999999 && used.has(String(next).padStart(6,"0"))) next++;
    if(next>999999) throw new Error("文章 ID 已达到六位数上限");
    const id=String(next).padStart(6,"0");
    await saveIndexNum(next);
    return id;
}

/**------【⑤.术业有专攻，读写KV方法集】-----**/

/* 【KV的Key的含义】
  SYSTEM_INDEX_LIST             文章列表(不包含内容)
  SYSTEM_INDEX_NUM              最新文章序号（不删除文章时，等于文章数量）
  SYSTEM_VALUE_WidgetMenu       导航栏
  SYSTEM_VALUE_WidgetCategory   分类目录
  SYSTEM_VALUE_WidgetTags       标签
  SYSTEM_VALUE_WidgetLink       链接
*/

//KV读取，toJson是否转为json，默认false
async function getKV(key, toJson=false){
  console.log("------------KV读取------------key,toJson:", key, toJson);
  let value=await CFBLOG.get(key);
  if(!toJson)
    return null==value?"[]":value;
  try{
    return null==value?[]:JSON.parse(value)
  }catch(e){
    return[]
  }
}
//KV读取，获取所有文章（含公开+隐藏）:仅后台使用
async function getAllArticlesList(){
  return await getKV("SYSTEM_INDEX_LIST", true);
}
//KV读取，最新文章序号（不删除文章时，等于文章数量），用于计算下个文章id
async function getIndexNum(){
  return await getKV("SYSTEM_INDEX_NUM", true);
}
//KV读取，获取导航栏
async function getWidgetMenu(){
  return await getKV("SYSTEM_VALUE_WidgetMenu", true);
}
//KV读取，获取分类目录
async function getWidgetCategory(){
  return await getKV("SYSTEM_VALUE_WidgetCategory", true);
}
//KV读取，获取标签
async function getWidgetTags(){
  return await getKV("SYSTEM_VALUE_WidgetTags", true);
}
//KV读取，获取链接
async function getWidgetLink(){
  return await getKV("SYSTEM_VALUE_WidgetLink", true);
}
//KV读取，获取文章详细信息
async function getArticle(id){
  return await getKV(id, true);
}

//写入KV，value如果未对象类型（数组或者json对象）需要序列化为字符串
async function saveKV(key,value){
    if(null!=value){
        if("object"==typeof value){
            value=JSON.stringify(value)
        }
        await CFBLOG.put(key,value)
        return true
    }
    return false;
}

//写入KV，获取所有文章（含公开+隐藏）:仅后台使用
async function saveArticlesList(value){
  const saved=await saveKV("SYSTEM_INDEX_LIST",value);
  if(saved){
    const current=Number(await CFBLOG.get("SYSTEM_PUBLIC_CACHE_VERSION"))||1;
    await CFBLOG.put("SYSTEM_PUBLIC_CACHE_VERSION",String(current+1));
  }
  return saved;
}
//写入KV，最新文章序号（不删除文章时，等于文章数量），用于计算下个文章id
async function saveIndexNum(value){
  return await saveKV("SYSTEM_INDEX_NUM", value);
}
//写入KV，获取导航栏
async function saveWidgetMenu(value){
  return await saveKV("SYSTEM_VALUE_WidgetMenu", value);
}
//写入KV，获取分类目录
async function saveWidgetCategory(value){
  return await saveKV("SYSTEM_VALUE_WidgetCategory", value);
}
//写入KV，获取标签
async function saveWidgetTags(value){
  return await saveKV("SYSTEM_VALUE_WidgetTags", value);
}
//写入KV，获取链接
async function saveWidgetLink(value){
  return await saveKV("SYSTEM_VALUE_WidgetLink", value);
}
//写入KV，获取文章详细信息
async function saveArticle(id,value){
  return await saveKV(id, value);
}

/**------【⑥.站在巨人肩膀上，基础方法】-----**/

//扩展String的方法：
//trim清除前后空格
String.prototype.trim=function(t){
  return t?this.replace(new RegExp("^\\"+t+"+|\\"+t+"+$","g"),""):this.replace(/^\s+|\s+$/g,"")
}
//replaceHtmlPara替换<!--{参数}-->
String.prototype.replaceHtmlPara=function(t,e){
  return null!=e&&(e=e.replace(new RegExp("[$]","g"),"$$$$")),this.replace(new RegExp("\x3c!--{"+t+"}--\x3e","g"),e)
}
//replaceAll 替换全部
String.prototype.replaceAll=function(t,e){
  return this.replace(new RegExp(t,"g"),e)
}

//小于2位，前面补个0
function pad(t){
    return t>=0&&t<=9?"0"+t:t
}

//排序（默认倒序）
function sort(arr, field, desc=true){
    return arr.sort((function(m,n){
        var a=m[field]||'0',
            b=n[field]||'0';
        return desc?(a>b?-1:(a<b?1:0)):(a<b?-1:(a>b?1:0))
    }))
}

//undefined转空字符串
function nullToEmpty(k){
  return k==undefined?'':k
}

//判断格式:字符串是否为json，或者参数是否为对象
function checkFormat(t){
    if("string"==typeof t){
        try{
            var e=JSON.parse(t);
            return !("object"!=typeof e||!e)
        }catch(t){
            return false
        }
    }
    return !("object"!=typeof t||!t)
}

//引入mustache.js，4.1.0：https://cdn.bootcdn.net/ajax/libs/mustache.js/4.1.0/mustache.min.js
(function(global,factory){typeof exports==="object"&&typeof module!=="undefined"?module.exports=factory():typeof define==="function"&&define.amd?define(factory):(global=global||self,global.Mustache=factory())})(this,function(){"use strict";var objectToString=Object.prototype.toString;var isArray=Array.isArray||function isArrayPolyfill(object){return objectToString.call(object)==="[object Array]"};function isFunction(object){return typeof object==="function"}function typeStr(obj){return isArray(obj)?"array":typeof obj}function escapeRegExp(string){return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function hasProperty(obj,propName){return obj!=null&&typeof obj==="object"&&propName in obj}function primitiveHasOwnProperty(primitive,propName){return primitive!=null&&typeof primitive!=="object"&&primitive.hasOwnProperty&&primitive.hasOwnProperty(propName)}var regExpTest=RegExp.prototype.test;function testRegExp(re,string){return regExpTest.call(re,string)}var nonSpaceRe=/\S/;function isWhitespace(string){return!testRegExp(nonSpaceRe,string)}var entityMap={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"};function escapeHtml(string){return String(string).replace(/[&<>"'`=\/]/g,function fromEntityMap(s){return entityMap[s]})}var whiteRe=/\s*/;var spaceRe=/\s+/;var equalsRe=/\s*=/;var curlyRe=/\s*\}/;var tagRe=/#|\^|\/|>|\{|&|=|!/;function parseTemplate(template,tags){if(!template)return[];var lineHasNonSpace=false;var sections=[];var tokens=[];var spaces=[];var hasTag=false;var nonSpace=false;var indentation="";var tagIndex=0;function stripSpace(){if(hasTag&&!nonSpace){while(spaces.length)delete tokens[spaces.pop()]}else{spaces=[]}hasTag=false;nonSpace=false}var openingTagRe,closingTagRe,closingCurlyRe;function compileTags(tagsToCompile){if(typeof tagsToCompile==="string")tagsToCompile=tagsToCompile.split(spaceRe,2);if(!isArray(tagsToCompile)||tagsToCompile.length!==2)throw new Error("Invalid tags: "+tagsToCompile);openingTagRe=new RegExp(escapeRegExp(tagsToCompile[0])+"\\s*");closingTagRe=new RegExp("\\s*"+escapeRegExp(tagsToCompile[1]));closingCurlyRe=new RegExp("\\s*"+escapeRegExp("}"+tagsToCompile[1]))}compileTags(tags||mustache.tags);var scanner=new Scanner(template);var start,type,value,chr,token,openSection;while(!scanner.eos()){start=scanner.pos;value=scanner.scanUntil(openingTagRe);if(value){for(var i=0,valueLength=value.length;i<valueLength;++i){chr=value.charAt(i);if(isWhitespace(chr)){spaces.push(tokens.length);indentation+=chr}else{nonSpace=true;lineHasNonSpace=true;indentation+=" "}tokens.push(["text",chr,start,start+1]);start+=1;if(chr==="\n"){stripSpace();indentation="";tagIndex=0;lineHasNonSpace=false}}}if(!scanner.scan(openingTagRe))break;hasTag=true;type=scanner.scan(tagRe)||"name";scanner.scan(whiteRe);if(type==="="){value=scanner.scanUntil(equalsRe);scanner.scan(equalsRe);scanner.scanUntil(closingTagRe)}else if(type==="{"){value=scanner.scanUntil(closingCurlyRe);scanner.scan(curlyRe);scanner.scanUntil(closingTagRe);type="&"}else{value=scanner.scanUntil(closingTagRe)}if(!scanner.scan(closingTagRe))throw new Error("Unclosed tag at "+scanner.pos);if(type==">"){token=[type,value,start,scanner.pos,indentation,tagIndex,lineHasNonSpace]}else{token=[type,value,start,scanner.pos]}tagIndex++;tokens.push(token);if(type==="#"||type==="^"){sections.push(token)}else if(type==="/"){openSection=sections.pop();if(!openSection)throw new Error('Unopened section "'+value+'" at '+start);if(openSection[1]!==value)throw new Error('Unclosed section "'+openSection[1]+'" at '+start)}else if(type==="name"||type==="{"||type==="&"){nonSpace=true}else if(type==="="){compileTags(value)}}stripSpace();openSection=sections.pop();if(openSection)throw new Error('Unclosed section "'+openSection[1]+'" at '+scanner.pos);return nestTokens(squashTokens(tokens))}function squashTokens(tokens){var squashedTokens=[];var token,lastToken;for(var i=0,numTokens=tokens.length;i<numTokens;++i){token=tokens[i];if(token){if(token[0]==="text"&&lastToken&&lastToken[0]==="text"){lastToken[1]+=token[1];lastToken[3]=token[3]}else{squashedTokens.push(token);lastToken=token}}}return squashedTokens}function nestTokens(tokens){var nestedTokens=[];var collector=nestedTokens;var sections=[];var token,section;for(var i=0,numTokens=tokens.length;i<numTokens;++i){token=tokens[i];switch(token[0]){case"#":case"^":collector.push(token);sections.push(token);collector=token[4]=[];break;case"/":section=sections.pop();section[5]=token[2];collector=sections.length>0?sections[sections.length-1][4]:nestedTokens;break;default:collector.push(token)}}return nestedTokens}function Scanner(string){this.string=string;this.tail=string;this.pos=0}Scanner.prototype.eos=function eos(){return this.tail===""};Scanner.prototype.scan=function scan(re){var match=this.tail.match(re);if(!match||match.index!==0)return"";var string=match[0];this.tail=this.tail.substring(string.length);this.pos+=string.length;return string};Scanner.prototype.scanUntil=function scanUntil(re){var index=this.tail.search(re),match;switch(index){case-1:match=this.tail;this.tail="";break;case 0:match="";break;default:match=this.tail.substring(0,index);this.tail=this.tail.substring(index)}this.pos+=match.length;return match};function Context(view,parentContext){this.view=view;this.cache={".":this.view};this.parent=parentContext}Context.prototype.push=function push(view){return new Context(view,this)};Context.prototype.lookup=function lookup(name){var cache=this.cache;var value;if(cache.hasOwnProperty(name)){value=cache[name]}else{var context=this,intermediateValue,names,index,lookupHit=false;while(context){if(name.indexOf(".")>0){intermediateValue=context.view;names=name.split(".");index=0;while(intermediateValue!=null&&index<names.length){if(index===names.length-1)lookupHit=hasProperty(intermediateValue,names[index])||primitiveHasOwnProperty(intermediateValue,names[index]);intermediateValue=intermediateValue[names[index++]]}}else{intermediateValue=context.view[name];lookupHit=hasProperty(context.view,name)}if(lookupHit){value=intermediateValue;break}context=context.parent}cache[name]=value}if(isFunction(value))value=value.call(this.view);return value};function Writer(){this.templateCache={_cache:{},set:function set(key,value){this._cache[key]=value},get:function get(key){return this._cache[key]},clear:function clear(){this._cache={}}}}Writer.prototype.clearCache=function clearCache(){if(typeof this.templateCache!=="undefined"){this.templateCache.clear()}};Writer.prototype.parse=function parse(template,tags){var cache=this.templateCache;var cacheKey=template+":"+(tags||mustache.tags).join(":");var isCacheEnabled=typeof cache!=="undefined";var tokens=isCacheEnabled?cache.get(cacheKey):undefined;if(tokens==undefined){tokens=parseTemplate(template,tags);isCacheEnabled&&cache.set(cacheKey,tokens)}return tokens};Writer.prototype.render=function render(template,view,partials,config){var tags=this.getConfigTags(config);var tokens=this.parse(template,tags);var context=view instanceof Context?view:new Context(view,undefined);return this.renderTokens(tokens,context,partials,template,config)};Writer.prototype.renderTokens=function renderTokens(tokens,context,partials,originalTemplate,config){var buffer="";var token,symbol,value;for(var i=0,numTokens=tokens.length;i<numTokens;++i){value=undefined;token=tokens[i];symbol=token[0];if(symbol==="#")value=this.renderSection(token,context,partials,originalTemplate,config);else if(symbol==="^")value=this.renderInverted(token,context,partials,originalTemplate,config);else if(symbol===">")value=this.renderPartial(token,context,partials,config);else if(symbol==="&")value=this.unescapedValue(token,context);else if(symbol==="name")value=this.escapedValue(token,context,config);else if(symbol==="text")value=this.rawValue(token);if(value!==undefined)buffer+=value}return buffer};Writer.prototype.renderSection=function renderSection(token,context,partials,originalTemplate,config){var self=this;var buffer="";var value=context.lookup(token[1]);function subRender(template){return self.render(template,context,partials,config)}if(!value)return;if(isArray(value)){for(var j=0,valueLength=value.length;j<valueLength;++j){buffer+=this.renderTokens(token[4],context.push(value[j]),partials,originalTemplate,config)}}else if(typeof value==="object"||typeof value==="string"||typeof value==="number"){buffer+=this.renderTokens(token[4],context.push(value),partials,originalTemplate,config)}else if(isFunction(value)){if(typeof originalTemplate!=="string")throw new Error("Cannot use higher-order sections without the original template");value=value.call(context.view,originalTemplate.slice(token[3],token[5]),subRender);if(value!=null)buffer+=value}else{buffer+=this.renderTokens(token[4],context,partials,originalTemplate,config)}return buffer};Writer.prototype.renderInverted=function renderInverted(token,context,partials,originalTemplate,config){var value=context.lookup(token[1]);if(!value||isArray(value)&&value.length===0)return this.renderTokens(token[4],context,partials,originalTemplate,config)};Writer.prototype.indentPartial=function indentPartial(partial,indentation,lineHasNonSpace){var filteredIndentation=indentation.replace(/[^ \t]/g,"");var partialByNl=partial.split("\n");for(var i=0;i<partialByNl.length;i++){if(partialByNl[i].length&&(i>0||!lineHasNonSpace)){partialByNl[i]=filteredIndentation+partialByNl[i]}}return partialByNl.join("\n")};Writer.prototype.renderPartial=function renderPartial(token,context,partials,config){if(!partials)return;var tags=this.getConfigTags(config);var value=isFunction(partials)?partials(token[1]):partials[token[1]];if(value!=null){var lineHasNonSpace=token[6];var tagIndex=token[5];var indentation=token[4];var indentedValue=value;if(tagIndex==0&&indentation){indentedValue=this.indentPartial(value,indentation,lineHasNonSpace)}var tokens=this.parse(indentedValue,tags);return this.renderTokens(tokens,context,partials,indentedValue,config)}};Writer.prototype.unescapedValue=function unescapedValue(token,context){var value=context.lookup(token[1]);if(value!=null)return value};Writer.prototype.escapedValue=function escapedValue(token,context,config){var escape=this.getConfigEscape(config)||mustache.escape;var value=context.lookup(token[1]);if(value!=null)return typeof value==="number"&&escape===mustache.escape?String(value):escape(value)};Writer.prototype.rawValue=function rawValue(token){return token[1]};Writer.prototype.getConfigTags=function getConfigTags(config){if(isArray(config)){return config}else if(config&&typeof config==="object"){return config.tags}else{return undefined}};Writer.prototype.getConfigEscape=function getConfigEscape(config){if(config&&typeof config==="object"&&!isArray(config)){return config.escape}else{return undefined}};var mustache={name:"mustache.js",version:"4.1.0",tags:["{{","}}"],clearCache:undefined,escape:undefined,parse:undefined,render:undefined,Scanner:undefined,Context:undefined,Writer:undefined,set templateCache(cache){defaultWriter.templateCache=cache},get templateCache(){return defaultWriter.templateCache}};var defaultWriter=new Writer;mustache.clearCache=function clearCache(){return defaultWriter.clearCache()};mustache.parse=function parse(template,tags){return defaultWriter.parse(template,tags)};mustache.render=function render(template,view,partials,config){if(typeof template!=="string"){throw new TypeError('Invalid template! Template should be a "string" '+'but "'+typeStr(template)+'" was given as the first '+"argument for mustache#render(template, view, partials)")}return defaultWriter.render(template,view,partials,config)};mustache.escape=escapeHtml;mustache.Scanner=Scanner;mustache.Context=Context;mustache.Writer=Writer;return mustache});
