---
layout: post
title: "비동기 통신을 위한 Ajax와 WEB API"
date: 2022-12-07 16:20:00+0900
categories: Programing
tags: Javascript AJAX
mathjax: true
---

# 비동기 통신

HTTP Request(요청)하고 이에 대한 Respone(응답)을 순차적으로 처리하지 않는 통신 방법입니다.

비동기식은 Requset와 이에 대한 Respone을 순차적으로 처리하는 동기식에 비해, 여러 요청을 동시에 수행할 수 있어 많은 이점이 있습니다.

이러한 이점을 통해

- 페이지 새로고침 없이 서버에 데이터를 요청 할 수 있으며,
- 서버로부터 데이터를 받고 이에 대한 이벤트를 **자연스럽게** 처리 할 수 있습니다.

<br>

# Ajax

Asynchronous Javascript And XML의 약자로 "에이젝스" 또는 "아작스"라고 읽습니다.

jqery에서 제공하는 ajax()와 혼돈하는 경우가 많은데,

> javascript로 XMLHttpRequest 객체를 이용해 서버와 클라이언트가 비동기로 통신하는 기법

을 말합니다.

WHATWG에서는 이러한 Ajax를 구현하기 위해 **[XMLHttpRequset](https://xhr.spec.whatwg.org/)** 또는 **[Fetch](https://fetch.spec.whatwg.org/)** 를 표준으로 관리하고 있습니다.

<br>

## XMLHttpRequset

XMLHttpRequest는 Internet Explorer의 XMLHTTP라고 불리는 ActiveX 기술로부터 시작되지만, 현재는 대부분의 브라우저에서 지원을 하고 있습니다.

XMLHttpRequest 인터페이스는 이용해 서버와 클라이언트가 비동기로 통신을 수행하이름에 XML이 들어가지만 모든 종류의 데이터를 담을 수 있습니다.

아래는 순수한 javascript로 ajax를 구현하는 예시입니다.

```javascript
// httpRequest.readyState에 대한 처리 처리 구현
function responeFunction() {}

// XMLHttpRequest 객체 생성
const httpRequest = new XMLHttpRequest();

// HTTP 요청의 상태가 변경 되었을 때 수행 될 함수 지정
httpRequest.onreadystatechange = responeFunction;

// HTTP 요청 정보 설정
httpRequest.open("GET", "test.json");

// HTTP 요청
httpRequest.send();
```

<br>

### Fetch

XMLHttpRequest를 이용한 AJAX는 복잡하기도 하고, 가독성이 좋지 않습니다.  
이를 보완하기 위해 ES6부터 Fetch를 지원하기 시작하였습니다.

Fetch API는 HTTP 파이프라인을 구성하는 요청과 응답 등의 요소를 Javascript에서 제어할 수 있도록 인터페이스를 제공합니다.

fetch는 매우 간단하게 구현 할 수 있습니다.

```javascript
// HTTP 요청
fetch("http://test.json").then((response) => console.log(response.json())); // 응답 처리
```

<br>

# Refernces

- [mdn web docs - Fetch 사용하기](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch)
- [mdn web docs - Ajax 시작하기](https://developer.mozilla.org/ko/docs/Web/Guide/AJAX/Getting_Started)
- [ECMAScript 2023 Internationlization API Specification](https://tc39.es/ecma402)
