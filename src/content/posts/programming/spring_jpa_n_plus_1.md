---
title: "N+1 문제"
subtitle: "ORM 성능 문제의 핵심과 해결법"
pubDate: 2025-01-19
category: "database"
tags: [jpa, orm, performance, database, query-optimization]
math: true
---

ORM을 쓰다 보면 반드시 한 번은 만나는 문제가 있다.

바로 N+1 문제다.

처음에는 잘 모르고 지나치다가 운영 환경에서 성능 문제로 터지는 경우가 많다.

---

## 1. N+1 문제란?

쿼리 1번으로 N개의 데이터를 가져온 뒤, 각 데이터마다 추가 쿼리가 실행되는 현상이다.

총 1 + N번의 쿼리가 발생한다.

예를 들어 게시글 100개를 조회하면, 게시글 조회 1번 + 작성자 조회 100번 = 101번의 쿼리가 나간다.

---

## 2. 왜 생기는가?

LAZY 로딩 때문이다.

```java
@Entity
public class Post {
    @ManyToOne(fetch = FetchType.LAZY)
    private Member author;
}
```

JPA는 기본적으로 연관 엔티티를 **프록시**로 두고, 실제 접근할 때 DB에서 가져온다.

그래서 각 Post마다 author를 호출하면 그때그때 SELECT가 발생한다.

---

## 3. 실제 쿼리 흐름

```java
List<Post> posts = postRepository.findAll();  // 1번 쿼리

for (Post post : posts) {
    String name = post.getAuthor().getName();  // N번 쿼리
}
```

첫 번째 줄에서 Post 목록만 가져온다.

두 번째 반복문에서 각 Post의 author에 접근할 때마다 SELECT가 나간다.

> 결과적으로 1 + N번의 쿼리가 발생한다.

---

## 4. 언제 문제가 되는가?

데이터가 적을 때는 티가 안 난다.

하지만 목록 조회가 빈번하거나 데이터가 많아지면 심각해진다.

**대표적인 케이스:**
- 게시판 목록 + 작성자
- 댓글 목록 + 작성자
- 주문 목록 + 주문 상품
- 알림 목록 + 관련 엔티티

---

## 5. 해결 방법

### 5.1 Fetch Join

가장 기본적인 방법이다.

```java
@Query("SELECT p FROM Post p JOIN FETCH p.author")
List<Post> findAllWithAuthor();
```

SQL 레벨에서 JOIN을 걸어서 한 번에 가져온다.

N+1이 완전히 사라진다.

**장점:**
- 쿼리 1번으로 해결
- 명확한 의도 표현

**단점:**
- JPQL을 직접 작성해야 함
- 페이징 시 컬렉션 조인은 주의 필요

---

### 5.2 EntityGraph

Fetch Join의 선언적 버전이라고 보면 된다.

```java
@EntityGraph(attributePaths = {"author"})
List<Post> findAll();
```

메서드에 어노테이션만 붙이면 내부적으로 JOIN이 걸린다.

JPQL 없이 깔끔하게 처리 가능하다.

**장점:**
- 선언적이라 깔끔함
- 메서드 네이밍 쿼리와 함께 사용 가능

**단점:**
- Fetch Join과 동일한 제약
- 복잡한 조건은 표현 어려움

---

### 5.3 Batch Size

완전히 막는 건 아니고, N+1을 완화하는 방식이다.

```java
@BatchSize(size = 100)
@ManyToOne(fetch = FetchType.LAZY)
private Member author;
```

또는 전역 설정:

```yaml
spring:
  jpa:
    properties:
      hibernate:
        default_batch_fetch_size: 100
```

IN 절로 묶어서 가져온다.

N개의 쿼리가 N/batch_size개로 줄어든다.

**장점:**
- 페이징과 함께 사용 가능
- 설정만으로 적용
- 컬렉션 조회에도 안전

**단점:**
- N+1이 완전히 사라지지는 않음
- 추가 쿼리는 여전히 발생

---

## 6. 어떤 방법을 선택할까?

상황에 따라 다르다.

**Fetch Join / EntityGraph:**
- 목록 + 단일 연관은 항상 함께 필요할 때
- toOne 관계
- N+1 완전 제거가 목표

**Batch Size:**
- 페이징이 필수
- 컬렉션 조회
- N+1 완화로도 충분

보통 기본은 Batch Size를 켜두고, 핵심 목록 조회는 Fetch Join이나 EntityGraph로 최적화한다.

---

## 7. 실무에서 자주 놓치는 부분

`@Transactional` 범위를 잘못 잡으면 다시 N+1이 생긴다.

```java
public List<PostDto> getPosts() {
    List<Post> posts = postRepository.findAll();  // 트랜잭션 밖
    return posts.stream()
        .map(post -> new PostDto(
            post.getTitle(),
            post.getAuthor().getName()  // 여기서 쿼리 발생
        ))
        .collect(toList());
}
```

트랜잭션이 끝난 뒤에 LAZY 로딩을 시도하면 각각 쿼리가 나간다.

`@Transactional(readOnly = true)`를 붙이거나 DTO 변환을 트랜잭션 안에서 해야 한다.

---

## 8. 정리

N+1 문제는 ORM의 숙명이다.

LAZY 로딩의 편리함과 성능 사이의 트레이드오프다.

해결 방법은 여러 가지지만, 상황에 맞게 선택하는 게 중요하다.

**핵심:**
- Fetch Join: 완전 제거
- Batch Size: 완화
- 트랜잭션 범위 주의

모니터링으로 쿼리 수를 확인하면서 하나씩 최적화하는 게 답이다.