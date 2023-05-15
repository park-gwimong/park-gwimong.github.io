---
layout: post
title: "jQuery ajax 배열데이터 전송 시 직렬화"
date: 2016-12-21 14:57:00+0900
categories: WEB
tags: jQuery ajax
mathjax: true
---


ajax는 javascript object를 전송하기 위한 기술입니다.
이 때, 전송하는 데이터는 직렬화하여야 합니다.

```javascript
[test.jsp]
dim_libel = ["aaaa","bbb"]

$.ajax({
   url : "test.do",
   type : "GET",
   data : { dim_libel : dim_libel},
   success : function(data) { ..... }
  });
```


```java
[testControl.java]
@RequestMapping(value="teset.do", method={RequestMethod.GET})	
	public @ResponseBody List<HashMap<String, Object>> getTest(@RequestParam(value="dim_libel", required=false) String[] dim_libel ) {

    log.debug(dim_libel);
} 
```


위 코드는 dim_libel에 2개의 문자열 데이터가 있는 배열을 Control로 전송하여 처리하는 코드입니다.
그냥 전송하면 
> http://localhost:8080/test.do?dim_label_arr%5B%5D=aaaa&dim_label_value%5B%5D=bbbb

위와 같이 [이 변환되서 전달되면서 정상적인 값이 Control로 전송되지 않습니다.

데이터가 직렬화되어 있지 않아, body에 정상적으로 포함되지 않았기 때문입니다.


jQeury의 ajax의 데이터 직렬화 옵션을 통해 간단하게 해결 할 수 있습니다.

```javascript
dim_libel = ["aaaa","bbb"]

jQuery.ajaxSettings.traditional = true;

$.ajax({

   url : "test.do",

   type : "GET",

   data : { dim_libel : dim_libel},

   success : function(data) { ..... }

  });
```
