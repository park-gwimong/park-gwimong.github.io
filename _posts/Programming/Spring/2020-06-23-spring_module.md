---
layout: post
title: "Spring Framework 이해하기 #2"
subtitle: "Overview of the Spring Framework"
date: 2020-06-23 13:00:00+0900
categories: Programming
tags: Spring
mathjax: true
---


# Spring Framework 모듈
Springdms 20여개의 모듈로 구성되어 기능을 제공합니다.  이러한 모듈은 다음 다이어그램과 같이 그룹화되어져 있습니다.  
![spring_overview](/resource/Spring/Concept/spring-overview.png)


## Core Container
### Beans
Spring DI의 핵심인 factory pattern을 Bean의 형태로 제공합니다.  
(Spring Bean은 자주 사용하는 객체를 singleton 생성하고, 어디서든 사용 할 수 있습니다)


### Core
> Spring Framework의 기본 기능을 제공하는 핵심 모듈입니다.

### Context
> Core 및 Beans 모듈의 견고한 기반에서 다양한 기능을 제공합니다.
> - JNDI 레지스티리와 유사한 방식의 객체 접근 방법 제공
> - 국제화, 이벤트 전파, 리소스 로드, 컨테이너 작성 등의 기능 지원
> - EJB, JMX 와 같은 JavaEE 기능 지원

### SpEL(Spring Expression Language)
> 런타임 시 객체 그래프를 쿼리하고 조작 할 수 있는 Expression Language를 제공합니다.  
> @Value 어노테이션과 같이 쓰일 수 있으며, 이 어노테이션과 SpEL의 조합을 통해 쉽게 데이터를 바인딩 할 수 있습니다.  

---

## AOP
> AOP(관점 지향 프로그래밍)을 지원하기 기능들을 제공합니다.

---

## Aspects
> AOP 모듈과는 독립적인 모듈로 AspectJ AOP를 지원합니다.

---

## Instrumentation
> 특정 애플리케이션 서버에서 사용되는 클래스 지원 수단 및 클래스 로더를 구현하기 위한 기능을 제공합니다.  
(spring-instrument-tomcat 모듈은 Tomcat용 클래스 지원 및 를래스 로더를 제공합니다.)

---

## Messaging
> 메시지 기반 app을 작성할 수 있는 기능을 제공합니다.

---

## Data Access / Integration
### JDBC
> JDBC를 사용하기 위한 템플릿 지원합니다.

### TX
> 트랜잭션 처리를 위한 추상 레이어를 제공합니다.

### ORM
 > JPA, Hibernate와 같은 ORM API를 위한 통합 계층을 제공합니다.

### OXM
> JAXB, Castor, JiBX 밑 XStream과 같은 객체 / XML 매핑 구현을 지원하는 추상화 계층을 제공합니다.

### JMS
> JMS(Java Messaging Service) 모듈과의 통합을 제공합니다.

### Transactions
> 트랙잭션을 관리 기능을 제공합니다.

---

## Web
### Web
> 웹어플리케이션 개발을 위한 기본적인 기능을 제공합니다.
> - spring-web : 멀티 파트 파일 업로드 기능 및 서블릿 리스너 등을 포함
> - spring-webmvc : Spring의 MVC 및 REST 웹 서비스 구현을 위한 모듈

### WebSocket
> 웹소켓을 지원하기 위한 추상 레이어를 제공합니다.

### Servlet
> Servlet을 처리하기 위한 통합 게층을 제공합니다.

### Portlet
> Portlet를 처리하기 위한 통합 계층을 제공합니다.

---

## Test
> Spring의 Test를 수행하기 위한 기능들 제공합니다.
> - JUnit 또는 TestNG를 사용하여 스프링 컴포넌트의 유닛 및 통합 테스트를 지원합니다.  
> - Spring ApplicationContext의 일관된 로딩과 캐싱 기능을 제공합니다.
> - 테스트를 위한 Mock(모의 객체)을 제공합니다.

---

# 참고
- https://docs.spring.io/spring/docs/5.0.0.RC3/spring-framework-reference/overview.html
