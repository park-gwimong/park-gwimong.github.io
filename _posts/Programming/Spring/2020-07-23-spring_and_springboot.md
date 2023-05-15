---
layout: post
title: "Spring과 SpringBoot"
subtitle: "Spring Boot의 이해"
date: 2020-07-23 15:00:00+0900
categories: Programming
tags: Spring SpringBoot
mathjax: true
---

Spring Framework(이하 Spring)은 Java 기반의 **엔터프라이즈 응용 프로그램**를 좀 더 편하게 개발하기 위한 프레임워크입니다.  
좀 더 편리하게 개발하기 위한 다양한 기능들이 추가되면서, Spring은 점점 복잡하고 입문하기 어려운 ~~고인물들의~~ 프레임워크가 되어버렸습니다.  


# Spring Boot란?
> Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications that you can "just run".
> We take an opinionated view of the Spring platform and third-party libraries so you can get started with minimum fuss. Most Spring Boot applications need minimal Spring configuration.

Spring Boot는 복잡해진 Spring 설정을 개발자가 최대한 신경쓰지 않고 서비스 로직 구현에 집중할 수 있도록 도와 줍니다.


# Spring Boot 기능
Spring Boot로 환경을 구성하면 다음과 같은 이점을 제공합니다.  
* 독립형 Spring Application 생성
* 내장 Tomcat을 이용하여 별도의 WAS 불필요
* 빌드 구성을 단순화
* Spring과 3rd part 라이브러리를 자동 구성
* Matrics, Health checks와 같은 프로덕션 지원 기능 제공
* 설정을 위한 XML 작성 불필요

# Spring Boot Architecture
Spring Boot는 다음의 단계를 수행합니다.

![SpringBootArchitecture](/resource/Spring/SpringBoot/SpringBootArchitecture.png)

- Spring Boot Staters :
정의된 Spring Boot stater들을 이용하여 필요한 라이브러리들을 다운로드/갱신 합니다.

- Auto Configuration : 
XML 또는 Java Configuration을 이용하여 수행 환경을 설정합니다.

- @SpringBootApplication : 
@SpringBootApplication로 지정된 클래스를 찾아 Servlet로 등록합니다.

- @ComponentScan :
@Component으로 지정된 클래스들을 찾아 IoC컨테이너에 Bean으로 등록합니다.


# Spring Boot Stater
Spring boot에는 'stater'라는 편리한 종속성 기술자들이 존재합니다.   
'stater'를 이용하면 라이브러리 간의 복잡한 의존성을 Spring boot가 알아서 관리해 줍니다.  
예를 들어, aspectJ로 AOP를 구현하고자 할
현재 제가 주로 사용하고 있는 'stater'은 다음과 같습니다.
> org.springframework.boot:spring-boot-starter-web  
> org.springframework.boot:spring-boot-starter-web-services  
> org.springframework.boot:spring-boot-starter-data-jpa  
> org.springframework.boot:spring-boot-starter-data-rest  
> org.springframework.boot:spring-boot-starter-security  
> org.springframework.boot:spring-boot-starter-actuator  
> org.springframework.boot:spring-boot-starter-thymeleaf  

# Spring Initializr
새로운 프로젝트를 시작하게 되면, 가장 많은 노력과 시간이 걸리는 부분이 개발환경을 구축하는 일입니다.  
Spring Initializr은 Spring에 대한 설정을 몇번의 클릭만으로 가능하게 합니다.  

![SpringInitializr](/resource/Spring/SpringBoot/SpringInitializr.png)
