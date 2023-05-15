---
layout: post
title: "Spring Web MVC 이해하기 #2"
subtitle: "Spring Web MVC 동작 구조"
date: 2020-06-30 17:00:00+0900
categories: Programming
tags: Spring DisignPattern
mathjax: true
---


Spring MVC는 다른 많은 웹프레임워크와 마찬가지로 Front Controller Pattern와 Command Pattern을 사용합니다. 


# 기본적인 Sevlet 구조
Servlet은 다음과 같은 web.xml 설정을 통해 요청과 Servlet이 1:1로 mapping 됩니다.
![defaultServlet](/resource/Spring/Concept/defaultServletPattern.png)
> ```xml
> <servlet>
>   <servlet-name>hello</servlet-name>
>   <servlet-class>HelloServlet</servlet-class>
> </servlet>
> <servlet>
>   <servlet-name>world</servlet-name>
>   <servlet-class>WorldServlet</servlet-class>
> </servlet>
>
> <servlet-mapping>
>   <servlet-name>hello</servlet-name>
>   <url-pattern>/hello</url-pattern>
> </servlet-mapping>
> > <servlet-mapping>
>   <servlet-name>world</servlet-name>
>   <url-pattern>/world</url-pattern>
> </servlet-mapping>
> ```

> ```java
> public class HelloServlet extends HttpServlet {
>   protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletExceptionb, IOException {
>       System.out.println("Do GET http method - /hello");
>   }
>   protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletExceptionb, IOException {
>       System.out.println("Do POST http method - /hello");
>   }
> }
> 
> public class WorldServlet extends HttpServlet {
>   protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletExceptionb, IOException {
>       System.out.println("Do GET http method - /world");
>   }
>   protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletExceptionb, IOException {
>       System.out.println("Do POST http method - /world");
>   }
> }
> ```

이러한 구조는 요청이 많아 질 수록 그만큼 Servlet도 많아져 복잡해집니다.

# Front Controller Pattern
이러한 단점을 해결하고자 Front Controller Pattern이 등장하였습니다.  
Front Controller을 해석하면 **"앞에 있는 컨트롤"**인 것처럼 모든 요청을 하나의 Servlet에서 받아 내부적으로 각 요청을 처리하는 형태입니다.
![frontControllerPattern](/resource/Spring/Concept/frontControllerPattern.png)

> ```xml
> <servlet>
>   <servlet-name>frontController</servlet-name>
>   <servlet-class>FrontController</servlet-class>
> </servlet>
> 
> <servlet-mapping>
>   <servlet-name>frontController</servlet-name>
>   <url-pattern>*.do</url-pattern>
> </servlet-mapping>
> ```

> ```java
> public class FrontController extends HttpServlet {
>   protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletExceptionb, IOException {
>       String url = request.getRequestURI().substring(request.contextPath.length());
>       if(url.equals("/hello.do")) {
>         System.out.println("Do GET http method - /http");
>       } else if(url.equals("/world.do")) {
>         System.out.println("Do GET http method - /world");
>       }
>   }
>   protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletExceptionb, IOException {
>       String url = request.getRequestURI().substring(request.contextPath.length());
>       if(url.equals("/hello.do")) {
>         System.out.println("Do POST http method - /http");
>       } else if(url.equals("/world.do")) {
>         System.out.println("Do POST http method - /world");
>       }
>   }
> }
> ```

FrontController 패턴은 모든 처리를 하나의 서블릿에서 처리하기 때문에 요청이 많아 질 수록 서블릿의 덩치가 커지게 됩니다.

# Command Pattern
Command 패턴은 Interface를 구현한 클래스에 요청을 분산 시켜 관리하는 디자인 패턴입니다.  
![frontControllerPattern_and_commandPattern](/resource/Spring/Concept/frontControllerPattern_and_commandPattern.png)

> ```xml
> <servlet>
>   <servlet-name>frontController</servlet-name>
>   <servlet-class>FrontController</servlet-class>
> </servlet>
> 
> <servlet-mapping>
>   <servlet-name>frontController</servlet-name>
>   <url-pattern>*.do</url-pattern>
> </servlet-mapping>
> ```

> ```java
> public interface Controller extends HttpServlet {
> }
>
> public class HelloController extends HttpServlet {
>   protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletExceptionb, IOException {
>       System.out.println("Do GET http method - /hello");
>   }
>   protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletExceptionb, IOException {
>       System.out.println("Do POST http method - /hello");
>   }
> }
> 
> public class WorldController extends HttpServlet {
>   protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletExceptionb, IOException {
>       System.out.println("Do GET http method - /world");
>   }
>   protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletExceptionb, IOException {
>       System.out.println("Do POST http method - /world");
>   }
> }
> 
> public class FrontController extends HttpServlet {
>   public HelloController helloController = new HelloController();
>   public WorldController worldController = new WorldContoroller();
>   protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletExceptionb, IOException {
>       String url = request.getRequestURI().substring(request.contextPath.length());
>       if(url.equals("/hello.do")) {
>           helloController(request, response);
>       } else if(url.equals("/world.do")) {
>           worldController(request, response);
>       }
>   }
>   protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletExceptionb, IOException {
>       String url = request.getRequestURI().substring(request contextPath.length());
>       if(url.equals("/hello.do")) {
>           helloController(request, response);
>       } else if(url.equals("/world.do")) {
>           worldController(request, response);
>       }
>   }
> }
> ```

이처럼 Spring MVC는 FrontControllerPattern과 CommandPattern을 적용하여 구현됩니다.
