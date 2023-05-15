---
layout: post
title: "Spring Framework 이해하기 #1"
subtitle: "Spring Framework에서 사용되는 핵심 개념들"
date: 2020-06-18 11:00:00+0900
categories: Programming
tags: Spring AOP DI IOC
mathjax: true
---

# Spring Framework?


> The Spring Framework provides a comprehensive programming and configuration model for modern Java-based enterprise applications - on any kind of deployment platform.[[원문]](https://spring.io/projects/spring-framework)

Spring Framework(이하 Spring)는 모든 종류의 배포 플랫폼에서 최신 Java 기반 **엔터프라이즈 응용 프로그램**을 위한 포괄적인 프로그래밍 구성 모델을 제공합니다.
즉, Spring은 Java 기반의 **엔터프라이즈 응용 프로그램**를 개발하기 위한 Framework라고 할 수 있습니다.  

**엔터프라이즈**라고 하니 JavaEE가 떠오릅니다.   
그럼 JavaEE와 Spring는 어떤 관계 일까요?  


# JavaEE와 Spring Framework

JaveEE(Java Platform, Enterprise Edition; JavaEE 또는 J2EE)는 자바를 이용한 서버측 개발을 위한 플랫폼이며 JavaSE에 JSP, EJB, Servlet, JNDI 같은 기능이 추가된 플랫폼입니다.  

특히 웹 개발을 위해 JavaEE에 포함된 JSP나 Servlet는 인기있는 [CGI](https://ko.wikipedia.org/wiki/공용_게이트웨이_인터네이스)로 자리 잡게 되면서, WebLogic이나 JBoss 같은 JavaEE와 호환되는 웹 어플리케이션 서버(Web Application Server; WAS) 제품들이 출시 되었습니다.  


이렇게 JavaEE는 많은 개발자들에게 주목을 받으며 널리 쓰이게 되었지만, 시간이 지남에 따라 몇 가지 심각한 문제가 발생하게 됩니다.  
(EJB 기능 중 표준화가 되어 있지 않는 기능이 있어 이와 호환되는 어플리케이션 서버 제품에 종속되어 버린다거나, 배포하기 위한 설정이 너무 복잡하다거나, EJB와 호환하기 위해서 고가의 WAS가 필요하다거나 등등)



# Spring Framework 특징	

다음은 가장 잘 알려진 Spring을 정의한 문구입니다.

> **Java Enterprise 개발을 편리하게 하기 위한 오픈소스 경량급 애플리케이션 프레임워크**


## "Java Enterprise 개발을 편리하게"
Spring은 로드 존슨이 2002년에 출반한 "Expert Ono-on-One J2ee Design and Developement"에 선보인 예제 코드에서 시작되었습니다.  
처음엔 JavaEE를 설명하기 위한 간단하게 구현한 코드였지만, 복잡한 Enterprise 개발을 조금 더 편리하고 단순하게 개발하기 위해 점점 발전하게 되었습니다.

위에 [#JavaEE와 Spring Framework]에 대해 서술한 것처럼 Spring에 대해 제대로 이해하기 위해서는 **POJO**라는 개념을 알아야 합니다.  

### POJO(Plain Old Java Object)
<span style="color:red;font-size:14px">"**Spring은 POJO를 지원하여 객체지향적인 다양한 설계와 구현이 가능한 프레임워크** 입니다."</span>
<br><br>
Plain Old Java Object를 그래로 해석하면 "오래된 방식의 간단한 자바 오브젝트"라는 말입니다.  
먼가 어려운 단어 인것 같지만, 실은 그냥 순수한 자바를 뜻하는 단어입니다.  

마틴 파울러가 밝힌 기원에 따르면,  

> An acronym for: **Plain Old Java Object**  
"The term was coined while Rebecca Parsons, Josh MacKenzie and I were preparing for a talk at a conference in September 2000. In the talk we were pointing out the many benefits of encoding business logic into regular java objects rather than using Entity Beans. We wondered why people were so against using regular objects in their systems and concluded that it was because simple objects lacked a fancy name. So we gave them one, and it's caught on very nicely." [[출처]](https://www.martinfowler.com/bliki/POJO.html)


JavaEE와 같은 중량 프레임워크에서 사용되는 Java 객체들을 보면, JavaEE에 선언되어 있는 Class를 상속받거나 interface를 구현하는 형태로 구성되어 있었고, 그러다보니 해당 프레임워크에 종속되는 경우가 많이 발생하였습니다.  
이러한 객체들과 구분하기 위해 고민을 하다가 먼가 있어보이게 하려고 붙인 이름이 **POJO** 인 것입니다.


### IoC(Inversion of Control) / DI(Dependency Injection)
<span style="color:red;font-size:14px">"**Spring은 DI를 이용하여 IoC를 잘 적용한 프레임워크** 중 하나입니다."</span>
<br>
- IoC(제어의 반전) : 프로그램의 제어 흐름이 변경 되는 소프트웨어 디자인 패턴  
- DI(의존성 주입)  : 외부에서 객체를 생성하고 이를 삽입하는 형태


다음은 일반적인 제어 흐름의 코드입니다.  

---
* EnglishBook Class
```java
class EnglishBook {
	public void read() {
		System.out.println("Read a book");
	}
}
```

* MathBook Class
```java
class MathBook {
	public void read() {
		System.out.println("Read a book");
	}
}
```

* Student Class
```java
class Student {
	EnglishBook book;
	Student() {
		book = new EnglishBook();
	}
	public void study() {
		this.book.read();
	}
}
```

* School Class
```java
class School {
	public void lesson() {
		Student student = new Student();
		student.study();
	}
}
```

---
Student 클래스는 EnglishBook 클래스의 인스턴스를 직접 생성하여 사용하고 있습니다.  
만약 MathBook 클래스를 사용하기 위해서는 Student 클래스를 수정하여야 하며, 이는 Student 클래스가 EnglishBook 클래스에 의존하고 있다고 표현할 수 있습니다.  

그렇다면 DI를 이용하여 IoC를 적용하면 어떻게 될까요.

---
* Book interface Class
```java
interface Book {
	void read();
}
```

* EnglishBook Class
```java
class EnglishBook implements Book {
	public void read() {
		System.out.println("Read a book");
	}
}
```

* MathBook Class
```java
class MathBook implements Book {
	public void read() {
		System.out.println("Read a book");
	}
}
```

* Student Class
```java
class Student {
	Book book;

	public setBook(Book b) {
		this.book = b;
	}

	public study() {
		if(book != null) {
			book.read();
		}
	}
}
```

* School Class
```java
class School {
	public void lesson() {
		EnglishBook englishBook = EnglishBook();
		MathBook mathBook = MathBook();

		Student student = new Student();
		student.setBook(englishBook);
		student.study();

		student.setBook(mathBook);
		student.study();
	}
}
```
Student 클래스의 setBook()으로 **EnglishBook와 MathBook의 객체**를 **주입(DI)**하여 클래스 간의 결합도를 낮추고, 프로그램의 구현 주체를 **Student &rarr; EnglishBook, MathBook**로 **제어의 흐름을 변경(IoC)**하였습니다. 


## AOP(Aspect Oriented Programming)
<span style="color:red;font-size:14px">"**Spring은 AOP를 지원하는 프레임워크** 입니다."</span>
<br>

AOP(관점 지향 프로그래밍)는 POP(절차 지향 프로그래밍), OOP(객체 지향 프로그래밍)과 같은 프로그래밍 패러다임 중 하나입니다.  

프로그래밍 패러다임은 결국 "관심의 분리(Separation of Concerns)" 입니다.  
POP가 프로시저를 기준으로 분리시킨 것처럼, OOP가 객체를 기준으로 분리 시킨 것처럼 AOP는 **"관점"**을 기준으로 분리시킨 프로그래밍 패러다임입니다. 


![spring_aop](/resource/Spring/Concept/spring_aop.png)  
<span style="color:blue;font-size:12px">* 가로 횡단 영역의 공통된 부분을 잘라냈다고 하여, AOP를 Cross-Cutting이라고 부르기도 합니다.</span>  

AOP는 클래스에서 비슷한 기능을 하는 부분인 Concern(관심사)를 모아 Aspect로 모듈화하고 이를 필요시 Class에 적용하는 형태로 구현됩니다.  

Spring은 로깅, 트렌잭션, 보안 등 다양한 AOP 모듈들을 제공합니다.  
