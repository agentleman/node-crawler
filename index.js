const request = require('superagent');  //发送请求模块
const cheerio = require('cheerio');     //转对象模块
const Koa = require('koa');             //搭建服务模块

const App = new Koa();

const url = 'https://www.lagou.com/zhaopin/webqianduan/?labelWords=label'; 

App.use(async ctx =>{
  const arr = [];   //存放爬取到的数据
  const data = await new Promise(resolve =>{
    request
      .post(url)  //爬取数据请求的地址
      .end((err, res)=>{
        const data = res.text;  //请求到的html文档
        const $ = cheerio.load(data); //html转对象
        //去分析原网页的dom结构 li的class为.con_list_item
        $('.con_list_item').each((i,v)=>{
          const $v = $(v);
          const obj = { //爬取class=position_link的a标签的href
            src: $v.find('a.position_link').prop("href"),
            zhili: $v.find('.li_b_l').text().trim(),
            money: $v.find('.money').text().trim(),
            name: $v.find('.company_name a').prop("href"),
            industry: $v.find('.industry').text().trim(),
          }
          arr.push(obj);
        })
        resolve(arr)
      })
  })
  ctx.body = arr; //将爬取的数据返回给前端
  console.log(arr)

})




App.listen("8080", () => {
  console.log('爬虫服务已启动！！！');
  console.log(cheerio)
});
