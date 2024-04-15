---
layout: post
title: "REST Api 아키텍처"
subtitle: "Restful한 Api 설계하기"
date: "2024-04-15 18:30:00+0900"
categories: [ "SoftwareEngineering" ]
tags: [ "RestAPI", "Architecture" ]
mathjax: true
---

# REST

REST(**RE** Presentational **S**tate **T**ransfer)는   
Roy Fielding이 2000년에 발표한 [논문](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)에 처음 등장한 분산형 하이퍼미디어
시스템의 아키텍처 스타일입니다.
> CHAPTER 5 : Representational State Transfer (REST)  
> This chapter introduces and elaborates the Representational State Transfer (REST) architectural style for distributed
> hypermedia systems, describing the software engineering principles guiding REST and the interaction constraints chosen
> to retain those principles, while contrasting them to the constraints of other architectural styles.
> REST is a hybrid style derived from several of the network-based architectural styles described in Chapter 3 and
> combined with additional constraints that define a uniform connector interface. The software architecture framework of
> Chapter 1 is used to define the architectural elements of REST and examine sample process, connector, and data views
> of
> prototypical architectures.
>
---

# REST 제약 조건

REST는 몇가지 제약 조건이 있으며, 이 가이드를 준수한 인터페이스를 RESTful하다고 표현합니다.

## Client-Server

하이브리드 스타일에 추가된 첫 번째 제약 조건은 Client-Server의 **관심사를 분리**시키는 것입니다.  
사용자 인터페이스 문제와 데이터 저장 등의 문제를 분리함으로써 여러 플랫폼에서 사용자 인터페이스의 이식성을 높이고,  
서버 구성 요소를 단순화하여 확장성을 향상시킬 수 있습니다.

## Stateless

하이브리드 스타일은 HTTP에서 영감을 얻었기 때문에, HTTP의 기본 원칙인 Stateless가 반영되었습니다.  
서버는 서비스 요청에 대한 어떤 것도 저장하지 않으며, 클라이언트의 모든 요청에는 해당 요청을 이 해할 수 있는 모든 정보가 포함되어야 합니다.

## Cache

요청에 대한 응답 내의 데이터에 암시적 또는 명시적으로 캐시 가능/불가능 라벨이 지정 되어야 합니다.  
이러한 캐시 사용은 일부 상호 작용을 부분적 또는 완전히 제거하여 평균 대기 시간을 줄여 효율성, 확장성 및 사용자의 인식 성능을 향상 시킬 수 있습니다.  
그러나 캐시 내의 오래된 데이터와 서버에 존재하는 데이터가 다를 경우 안정성이 감소 할 수 있습니다.

## Uniform Interface

REST 아키텍처 스타일의 핵심은 **구성 요소 간의 균일한 인터페이스**를 강조하는 것입니다.  
소프트웨어 엔지니어링의 일반 원칙을 컴포넌트 인터페이스에 적용함으로써 전체 시스템 아키텍처가 **단순화**되고 가시성이 향상됩니다.  
이러한 아키텍처는 서비스와 분리되어 독립적으로 발전 할 수 있으나, 표준화된 형식이 아닌 경우 균일한 인퍼페이스는 오히려 효율성을 저하 시킬 수 있습니다.

즉, REST 인터페이스는 대규모 하이퍼미디어 데이터 전송에 효율적으로 설계되어 웹의 일반적인 경우에는 최적의 효율을 낼 수 있지만, 다른 형태의 아키텍처 상호 작용에는 적합하지 않을 수 있습니다.

## Layered System

인터넷 규모 요구 사항에 대한 동작을 개선하기 위해 추가 된 제약 조건입니다.  
계층형 시스템 스타일은 각 구성 요소가 상호 작용하는 인접 계층을 볼 수 없도록 구성 요소 동작을 제한합니다.  
이러한 구조는 각 계층의 독립성을 보장하며 보안, 로드 밸런싱, 암호화 등 여러 계층을 유연성 있게 추가/삭제 할 수 있습니다.

## Code-On-Demand(Optional)

애플릿이나 스크립트 형식으로 코드를 다운로드하고 이를 실행 할 수 있는 기능을 제공합니다.  
이 기능은 시스템에 유연성과 확장성을 제공 할 수 있지만, 가시성을 감소시키므로 선택적인 제약 사항입니다.

> REST 스타일을 제시한 시점에는 Web은 대부분 정적 document이었으며, 클라이언트에서 비즈니스 로직을 구현하기에는 많은 어려움이 있었습니다.  
> 이러한 환경을 고려하여 Code-On-Demand 기능을 선택적으로나마 제약 조건으로 추가한 것으로 추측 됩니다.  
> 현재에는 보안상 문제로 인해 거의 적용하지 않습니다.


---

# 설계 원칙

Restfull한 API를 설계하기 위해 다음의 4가지 원칙을 준수합니다.

## 자원을 식별 할 수 있어야 한다.

가장 기본적인 원칙으로 URL만으로 어떤 자원을 제어 할 수 있는지 알 수 있어야 합니다.  
즉, URL은 특정 자원의 위치 및 종류에 대한 정보를 포함하며 URL만으로 자원을 명확히 식별 할 수 있어야 합니다.

## 행위는 명시적이어야 한다.

자원을 제어하기 위한 행위는 명시적이어야 합니다.  
강제된 사항은 아니지만, 일반적으로 HTTP Method으로 표현합니다.

- GET : Select
- POST : Create
- PUT : Update
- DELETE : Delete

## 자기 서술적이어야 한다.

데이터 처리를 위한 모든 정보가 포함 되어야 합니다.

## HATEOS

Hypermedia as the Engine of Application Sate.  
서버는 하이퍼미디어를 이용하여 애플리케이션 상태 전이를 수행 할 수 있어야 합니다.

---

# 설계 규칙

Restfull API를 설계하기 위해 다음의 규칙들을 권장합니다.

- **슬래시 구분자(/)는 계층 관계를 나타내는데 사용합니다.**
    - Ex) http://restapi.example.com/users/groups


- **리소스는 동사가 아닌 명사를 사용합니다.**
    - 도큐먼트 이름: 단수 명사
    - 컬렉션 이름 : 복수 명사
    - 스토어 이름 : 복수 명사

- **경로 중 변하는 부분은 유일한 값으로 대체합니다.**
    - 리소스 간 연관 관계가 있는 경우(일반적으로 소유 관계를 표현 시) : /[리소스]/{리소스 id}/[다른 리소스]
    - Ex) http://restapi.example.com/users/{userid}/children → http://restapi.example.com/users/12/children


- **자원에 대한 행위는 HTTP Method로 표현합니다.**
    - Ex) GET   http://restapi.example.com/users/delete/1 (x)
    - Ex) DELETE http://restapi.example.com/users/1 (o)


- Trailing slash(URI의 끝에 붙이스는 슬래시)는 사용하지 않는다.
    - 트레일링 슬래시(Trailing slash)는 해당 URL 리소스가 디렉토리(directory)임을 의미하기 위해 사용 되었습니다.
    - REST에서 슬래시 구분자는 각 계층의 관계를 나타내는데 사용되고 있으므로, 트레일링 슬래시는 혼동을 줄 수 있습니다.
    - Ex) http://restapi.example.com/users/groups/ (x)
    - Ex) http://restapi.example.com/users/groups  (o)


- 불가피하게 2음절 이상의 리소스를 표현해야 한다면, 하이픈(-)을 사용합니다.
    - 밑줄 때문에 문자가 가려지기도 하므로 가독성을 위해 하이픈을 사용합니다.
    - Ex) http://restapi.example.com/colors/deep_blue (x)
    - Ex) http://restapi.example.com/colors/deep-blue (o)


- URI 경로는 소문자를 사용합니다.
    - RFC 3986(URI 문법 형식)은 URI 스키마와 호스트를 제외하고는 대소문자를 구별하도록 규정되어 있습니다.


- 파일 확장자는 URI에 포함하지 않습니다.
    - Accept header를 사용합니다.
    - Ex) http://restapi.example.com/users/1/photo.jpg(x)
    - Ex) http://restapi.example.com/users/1/photo  <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Accept: image/jpg (o)


---
[참고 문서]

- https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm
- https://restfulapi.net/