---
layout: post
title: "HTTP의 발전"
date: 2023-01-10 18:43:00+0900
categories: WEB
tags: HTTP Protocol
mathjax: true
---

# HTTP의 시작
HTTP는 **HyperText Transfer Protocol**의 약자로,  
1989년 월드 와이드 웹이 개발되면서 데이터 전송을 위한 프로토콜입니다.  

---

## HTTP/0.9
원라인 프토로콜로도 불리는 HTTP/0.9는 HTTP/1.0 이전의 프로토콜을 명시하기 위한 버전입니다.
(HTTP/1.0 이전에는 별도로 버전 번호를 부여하지 않았으나, HTTP/1.0과 구분하기 위함)


HTTP/0.9는 요청 메서드가 GET만 존재하였으며, 매우 단순한 구조의 프로토콜입니다.  

---

## HTTP/1.0
프로토콜 확장을 위한 여러 노력들이 반영되었습니다.  

- 각 요청 시 버전 정보를 포함합니다.
- 상태 코드가 추가 되었습니다.
- HTTP 헤더가 추가 되엇습니다.
- Content-Type에 문서 정보를 명시 할 수 있어, 다양한 문서들을 전송 할 수 있습니다.

그 외에 여러 새로운 기능들을 시도하였으며 이러한 내용을 RFC 1945(1996년 11월)에 공개되었습니다.

___

## HTTP/1.1
최초의 표준 프로토콜로 RFC 2068(1997년 1월)에 처음 공개되으며,

HTTP/1.0의 모호함을 명확하게 정의하고 많은 개선 사항들을 적용하였습니다.  

- 커넥션 재사용
- Pipelining 도입
- 청크된 응답 지원
- 캐시 제어 매커니즘 도입
- Host 헤더 추가  
(동일 ip 주소에 다른 도메일을 호스팅 가능 -> [Colocation](https://en.wikipedia.org/wiki/Colocation_(business)) 가능)


___

## HTTP/2.0
더 나은 성능을 위한 프로토콜입니다.  

- 이진 프로토콜
- 요청과 응답의 멀티플렉싱을 지원
- 전송된 데이터의 불필요한 오버헤드를 제거하고, 유사한 내용의 헤더들을 압축( [HPACK](https://httpwg.org/specs/rfc7541.html) 적용)

___

## HTTP/3.0
TCP/TSL가 아닌 QUIC를 사용합니다.

> [QUIC(Quick UDP Internet Connection)](https://ko.wikipedia.org/wiki/QUIC) :
범용 목적의 전송계층 통신 프로토콜로서, TCP가 아닌 UDP를 이용하여 다중화 연결을 지원하는 방식입니다.
