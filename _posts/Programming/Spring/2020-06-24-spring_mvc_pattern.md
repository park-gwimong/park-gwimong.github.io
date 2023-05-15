---
layout: post
title: "Spring Web MVC 이해하기 #1"
subtitle: "모델2와 MVC Pattern"
date: 2020-06-24 11:00:00+0900
categories: Programming
tags: Spring DisignPattern
mathjax: true
---

# Spring MVC
공식 이름인 "Spring Web MVC"(이하. Spring MVC)는 Spring Framework의 모듈 중 하나인 "spring-webmvc"에서 유래하였습니다. 
Spring MVC는 Servlet API를 기반으로 구축된 최초의 웹 프레임워크입니다.

# Model1, Model2 그리고 MVC
Spring MVC에 대해 말할 때, 항상 언급되는 것이 Model1과 Mode2입니다.  
Model1과 Model2는 Java web application의 설계에서 흔히 사용되는 소프트웨어 디자인 패턴입니다.  
(물론, Java web applicaion에서만 적용되는 디자인 패턴은 아닙니다.)  

## Model1  
> 표시되는 부분과 로직을 하나의 서블릿에 함께 구현하는 디자인 패턴  

![model1](/resource/Spring/Mvc/model1.png)

## Model2  
> 표시되는 부분과 로직을 구별하여 구현하는 디자인 패턴  

![model2](/resource/Spring/Mvc/model2.png)


간단하게 정리하면, Logic과 Content가 함께 있느냐 없느냐로 보면 될 것 같습니다.  
예전에는 JSP에 Java Code와 Html이 모두 존재하는 Model1로 많이 구현하였습니다..  
하지만 웹디자이너와 웹개발자를 구분하기 시작하면서 JSP는 Html과 JavaScript 코드 등 View 역활만 하고, 서비스 로직은 별도의 Servlet에 구현하는 추세입니다.


## MVC
> M(Model) V(View) C(Controller)로 구분지어 구현하는 디자인 패턴  

MVC는 소프트웨어 공학에서 사용되는 소프트웨어 디자인 패턴 중 하나입니다.  
MVC에서 Model은 데이터를 나타내며, View는 사용자에게 보여지는 부분을, Controller는 Model과 View 사이의 상호동작을 관리합니다.  

### MVC1(= MVC + Model1)
![mvc1](/resource/Spring/Mvc/mvc1.png)  
MVC에 Model1를 적용한 모델입니다.  
JSP에 Model, Controller, View 코드가 모두 혼재되어 있습니다.  
간단한 웹페이지를 구현할 때 사용됩니다.

### MVC2(= MVC + Model2)
![mvc2](/resource/Spring/Mvc/mvc2.png)  
MVC에 Model를 적용한 모델입니다.  
Model, Controller, View가 모두 완벽히 분리되어 있습니다.  

## Spring MVC
Spring MVC는 Spring Framework를 이용하여 MVC 디자인 패턴으로 구현하는 것을 말합니다.  
Spring Framework는 이러한 MVC 구조로 구현하기 위한 다양한 모듈들을 포함하고 있으며, 많은 웹프로젝트가 MVC2 패턴을 사용하고 있습니다.  

---
개인 생각 :   
MVC2 디자인 패턴에서의 View는 단순히 사용자에게 데이터를 표출하는 역활을 하므로, JSP가 아닌 Html + JavaScript(+ UI Framework)로 구현하는게 좀 더 MVC스럽지 않나 생각합니다.  
Spring Framework 뿐만 아니라 WPF, NodeJS 등 다른 Framework에서도 MVC 패턴과 유사한 패턴들(MVP, MVVM 등)로 구현하는게 최근 개발 트렌드인 것 같습니다.

