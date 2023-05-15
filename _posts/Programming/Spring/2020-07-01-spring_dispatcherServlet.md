---
layout: post
title: "Spring Web MVC 이해하기 #3"
subtitle: "DispatcherServlet의 이해"
date: 2020-07-01 17:00:00+0900
categories: Programming
tags: Spring
mathjax: true
---


# DispatcherServlet 역활
DispatchserServlet는 Spring MVC에 정의된 유일한 **Front Controller**입니다.  
즉, Spring MVC에서 모든 요청을 받아 적절한 Controller와 View에 전달하고 요청에 대한 처리 결과를 출력하는 역활을 수행합니다.

# DispatcherServlet 흐름
![dispatchserServlet_flow](/resource/Spring/Concept/dispatcherServletFlow.png)

1. 사용자가 요청한 내용을 Servlet Container(WAS)이 Dispacher Servlet에 전달합니다.
2. DispacherServlet는 요청받은 URL과 매핑된 Controller정보를 HandllerMapping에 요청합니다.
3. HandlerMapping은 해당 URL을 처리할 Controller를 찾아  DispatcherServlet에 전달합니다.
4. DispatcherServlet는 찾은 Controller에 사용자 요청 정보를 전달합니다.
5. Controller은 Model에 필요한 정보들을 요청합니다.
6. Model정보를 가져와 사용자 요청에 필요한 서비스 로직을 수행합니다.
7. Controller은 모든 서비스 로직을 수행 후 데이터와 표출할 View 정보를 포함한 ModelAndView 객체를 전달합니다. (ModelAndView가 아닌 View Name을 전달하기도 하고, View가 없는 RestAPI로 구현된 경우 HttpStatus 객체를 바로 반환하기도 합니다)
8. 표출할 View Name을 ViewResolver에 전달합니다.
9. VewResolver는 해당 View 정보를 찾아 DispatcherServlet에 반환합니다.
10. DispatcherServlet는 해당 View에 표출할 정보들을 전달합니다.
11. 해당 View는 표출할 정보를 포함하여 DispatcherServlet에 반환합니다.
12. DispatcherServlet는 표출할 View 정보를 Servlet Container에 반환합니다.

# DispatcherServlet 설정
## web.xml에 DispatchserServlet 설정하기

> ```xml
> <servlet>
>    <servlet-name>dispatcher</servlet-name>
>    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
>    <init-param>
>       <param-name>contextConfigLocation</param-name>
>       <param-value>/WEB-INF/dispatcher-servlet.xml</param-value>
>    </init-param>
> </servlet>
> 
> <servlet-mapping>
>     <servlet-name>dispatcher</servlet-name>
>     <url-pattern>/</url-pattern>
> </servlet-mapping>
> ```

위와 같이 설정 되어 있는 경우 **/WEB-INF/dispatcher-servlet.xml** 파일을 참조하여 DispatcherServlet이 생성되고, 모든 요청에 대하여 처리합니다.  
(contextConfigLocation을 생략할 경우 기본적으로 웹어플리케이션의 **/WEB-INF/[서블릿이름]-servlet.xml** 파일에서 정보를 읽어옵니다.)

## dispatcher-servlet.xml 설정
DispatcherServlet는 요청한 URL을 처리하기 위한 Controller와 View를 연결 시켜 주는 역활을 합니다.  
dispatcher-servlet.xml는 Handller와 ViewResolver 등의 class를 bean으로 등록합니다.

> ```xml
> <?xml version="1.0" encoding="UTF-8"?>
> <beans xmlns="http://www.springframework.org/schema/beans"
>        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
>        xmlns:mvc="http://www.springframework.org/schema/mvc"
>        xmlns:context="http://www.springframework.org/schema/context" >
> 
>   <mvc:annotation-driven>
>       <mvc:message-converters>
>           <bean class="org.springframework.http.converter.json.MappingJackson2HttpMessageConverter">
>               <property name="objectMapper" ref="objectMapper"/>
>           </bean>
>       </mvc:message-converters>
>       <mvc:argument-resolvers>
>           <bean class="MyArgumentResolver" />
>       </mvc:argument-resolvers>
>   </mvc:annotation-driven>
> 
>    <bean id="objectMapper" class="org.springframework.http.converter.json.Jackson2ObjectMapperFactoryBean" />
> 
>    <bean class="org.springframework.web.servlet.view.UrlBasedViewResolver">
>        <property name="viewClass" value="org.springframework.web.servlet.view.JstlView"/>
>        <property name="prefix" value="/WEB-INF/views/"/>
>        <property name="suffix" value=".jsp"/>
>    </bean>
></beans>
> ```

Xml에 DispatcherServlet의 다양한 설정을 추가할 수 있습니다.  
개발자마다 다르긴 하지만, xml에 많은 설정들을 일일히 입력하는 것은 복잡하고 어렵습니다.  

이에 **Spring Boot**가 등장하면서 많은 부분들이 생략되거나 간략화되었습니다.  
최근에는 거의 대부분의 설정을 Java Configuration에 설정 가능하며, web.xml에 어떠한 설정도 하지 않아도 됩니다.

상세한 설정 내용은 **Spring Boot**를 정리하며 Java Configuration 기준으로 정리하고자 합니다.