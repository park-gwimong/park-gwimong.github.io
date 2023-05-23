---
layout: post
title: "HTTP Cookie의 Security"
date: 2023-05-18 14:47:00+0900
categories: Security
tags: Security Http Cookie
mathjax: true
---

# Http Cookie

HTTP Cookie는 서버에 의해 브라우저에 저장되는 데이터 조각입니다.  
Cookie는 2개의 유형으로 나뉩니다.

- persistent cookies : 만료일을 가지는 cookie로, 사용자 경험을 저장하기 위해 주로 사용
- session cookies : 세션 종료와 함께 삭제되는 cookie로, 자격 증명 등을 저장하기 위해 주로 사용


---

# Session과 Cookie
Http는 connectionless & Stateless(무상태성, 상태 정보를 가지 않는) 프로토콜입니다.  
서버는 요청한 클라이언트의 상태 정보를 알 수 없기 때문에, 매번 인증 절차를 수행해야 합니다.  

![sessionProcess](/resource/20230518/20230518-image-1.png)
1. Client A는 Server로 사용자 정보를 전송하여 인증 절차를 수행합니다.
2. Server는 Client A의 대한 Session을 생성하여 Set-Cookie에 담아 Client에 전송합니다.
3. 이 후, Client A는 Server로 요청 시, 세션 정보를 cookie에 담아 함께 전송합니다.
4. Server는 Session cookie를 해석하여 Client A라는 것을 확인하고, 요청을 처리합니다.



# Cookie security
사용자의 편의성을 개선하기 위하한 데이터는 노출이 되도 큰 문제가 없지만,  
Session cookie와 같이 인증 정보를 저장하고 있는 cookie가 탈취 되면 보안에 큰 위협이 될 수 있습니다.


## HttpOnly 속성
cookie는 Client의 브라우저에 저장되는 데이터이다 보니, 아래의 코드 한줄이면 손쉽게 획득 할 수 있습니다.
```javascript
<script> document.cookie </script>
```

이러한 취약점을 해결하기 위해, Cookie를 생성 할 때 브라우저에서 접근하지 못하도록 설정 할 수 있습니다.  
```javascript
Set-Cookie: cookie명:cookie값; path=/; HttpOnly
```
Set-Cooike에 HttpOnly를 추가함으로써 HTTP Only Cookie 속성이 활성화되며, 해당 cookie는 브라우저에서 접근 할 수 없습니다.  
(HttpOnly의 기본 값은 false 입니다.)  

## Secure 속성
HTTP는 단순히 데이터를 전송하기 위한 어플리케이션 계층의 프로토콜이므로, 네트워크 구간을 감청한다면 데이터와 Cookie를 가로 챌 수 있습니다.  
이러한 통신상의 보안을 강화한 HTTPS는 SSL이나 TLS 프로토콜을 통해 세션 데이터를 암호화하여 통신합니다.  

```javascript
Set-Cookie: cookie명:cookie값; path=/; Secure
```
Cookie의 Secure을 활성하면, 브라우저는 HTTPS 통신일 경우에만 해당 Cookie를 전송합니다.  
(Secure의 기본 값은 false 입니다.)  