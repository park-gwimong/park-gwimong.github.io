---
layout: post
title: "Spring Framework 이해하기 #4"
subtitle: "Spring의 IoC, 그리고 DI"
date: 2021-04-13 15:24:00+0900
categories: Programming
tags: Spring
mathjax: true
---


# IoC 개념
IoC(Inversion Of Control)을 해석하면 **"제어의 역전"**으로 해석 할 수 있습니다.  

개발자가 작성한 코드에서 외부 라이브러리의 코드를 호출하여 이용하는 것이 일반적인 흐름인데,  
IoC는 이러한 흐름이 반전되어 외부 라이브러리의 코드가 개발자가 작성한 코드를 호출하는 소트프웨어 디자인 패턴입니다.  


```java
public class ServerFacade
{
  public Object respondToRequest(Object pRequest)
  {
    if(businessLayer.validateRequest(pRequest))
    {
      DAO.getData(pRequest);
      return Aspect.convertData(pRequest);
    }

    return null;
  }
}
```
위 코드는 개발자가 작성한 SeverFacade 코드 내에서 DAO와 Aspect 객체를 직접 접근하여 제어하고 있는 일반적인 흐름을 가지고 있습니다.  

IoC(제어 반전)를 적용하면 아래와 같이 작성 할 수 있습니다.  

```java
public class ServerFacade
{
  public Object respondToRequest(Object pRequest, DAO dao)
  {
    return dao.getData(pRequest);
  }
}
```
개발자가 작성한 ServerFacade의 respondtoRequest 함수에서는 전달받은 DAO 객체에게 제어를 이양하게 됩니다.  

이러한 디자인 패턴을 사용하는 이유는 다음과 같습니다.  
- 작업을 구현하는 방식과 작업 수행 자체를 분리
- 모듈을 개발할 때, 해당 모듈의 목적에만 집중하여 개발
- 모듈을 교체하여도 전체 시스템에 영향을 미치지 않음

<br>

# IoC Container이란?
Spring에서는 Ioc Container를 이용해 Bean 객체의 생명 주기를 관리합니다.  
즉, 개발자가 직접 POJO를 생성하지 않고, IoC Container를 이용해 Bean 객체를 제어합니다.  

## IoC Container의 종류
### BeanFactory
Bean을 생성하고 의존 관계를 정의하는 등의 가장 기본적인 기능을 제공하며 Factory pattern이 적용된 Interface를 제공합니다.  
> Factory pattern : 객체를 생성하기 위해 인터페이스를 정의하지만, 어떤 클래스의 인스턴스를 생성할지에 대한 결정은 서브 클래스가 결정하는 디자인 패턴

BeanFactory로 구현한 Container는 DI 관점만 가지고 있으며, Bean을 실제 사용 할 때 로딩하는 Lazy-Loading 방식을 사용하고 있어 가벼운 경량 Container입니다.  

### ApplicationContext
BeanFactory보다 더 다양한 기능을 제공하는 하는 Interface로, 아래의 기능을 추가적으로 제공합니다.  
- 국제화가 지원하는 테스트 메시지 관리
- 다양한 파일을 로드 할 수 있는 포괄적인 방법 제공
- 리스너로 등록된 Bean에게 Event를 발생

ApplicationContex로 구현한 Container는 실행 시점에 모든 Bean을 로딩하는 Eager-Loading 방식을 사용하고 있어 무거운 Container입니다.  

하지만 Spring Framework의 목적이 복잡한 Java Servlet 개발을 좀 더 쉽고 편하게 개발하기 위함이므로 Spring의 공식 문서에도 특별한 이유가 없다면 ApplicationContext를 구현하는 것을 권장하고 있습니다.  

# IoC 분류
## DL(Dependency Lookup)  
의존성 검색 : 저장소에 저장되어 있는 Bean에 접근하기 위해 컨테이너가 제공하는 API를 이용하여 Bean을 참조 하는 방법


```java
String myConfigLocation = "classpath:myApplicationCTX.xml";
AbstractApplicationContext ctx = new GenericXmlApplicationContext(myConfigLocation);
MyObject myObject = ctx.getBean("myObject", MyObject.class);
```

AbstractApplicationContext IoC Container에 myApplicationCTX.xml 파일을 저장소로 등록하고 해당 저장소에서  MyObject Bean을 찾습니다.  

## DI(Dependency Injection)  
의존성 주입 : 각 클래스간의 의존 관계를 설정 정보를 바탕으로 컨테이너가 자동으로 연결 해주는 방법  

---

### Setter Injection  
setter 함수를 이용하여 의존성을 주입하는 방법입니다.  
```java
public class BeanObject{
    String owner;
    
    public void setOwner(String owner){
        this.owner = owner;
    }
}
```

---

### Constructor Injection  
생성자 함수를 이용하여 의존성을 주입하는 방법입니다.  
```java
public class MyObject{
    private BeanObject myBean;
    private BeanObject yourBean; 
    
    public MyObject(BeanObject myBean, BeanObject yourBean){
        this.mybean = mybean;    
        this.yourBean = yourBean;
    }
}
```

---

### Method Injection  
일반 함수를 이용하여 의존성을 주입하는 방법입니다.  
```java
public abstract class MyObject{
    private BeanObject myBean;
    
    public void setCustomBeanObject(BeanObject myBean){
        this.myBean = myBean;
    }
    
    public abstract BeanObject getCustomBeanObject();
}

```
