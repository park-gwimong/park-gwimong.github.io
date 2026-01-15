---
title: JPA에서 @EntityGraph는 어떻게 N+1 문제를 해결할까?
pubDate: 2025-01-15
category: Programming
tags: [jpa, entitygraph, n+1, performance, spring-data-jpa]
math: true
draft: false
---

JPA를 쓰다 보면 거의 반드시 한 번은 마주치는 문제가 있다.
바로 **N+1 문제**다.

보통은 `fetch join`으로 해결한다고 알려져 있지만, 매번 JPQL에 `join fetch`를 직접 쓰는 방식이 부담스럽거나 번거로운 경우도 많다.

이럴 때 자주 등장하는 대안이 바로 `@EntityGraph`다.

그런데 이런 질문이 자연스럽게 생긴다.

> "`@EntityGraph`는 도대체 내부에서 뭘 하길래 N+1이 안 생기는 걸까?"

이 글에서는 `@EntityGraph`가 무엇을 하는지, JPA 내부 동작 관점에서 **왜 N+1이 사라지는지**를 중심으로 정리해본다.

---

## 1. N+1 문제는 왜 생길까?

가장 전형적인 예부터 보자.

```java
List<Post> posts = postRepository.findAll();

for (Post post : posts) {
    post.getAuthor().getName();
}
```

엔티티 구조는 다음과 같다고 가정하자.

```java
@ManyToOne(fetch = FetchType.LAZY)
private Member author;
```

**JPA의 기본 동작을 보면,**

1. `findAll()` 실행 → Post 목록을 가져오는 쿼리 **1번**
2. `author`는 LAZY → 실제 Member는 아직 조회되지 않고 **프록시**
3. `getAuthor()` 호출 시점마다 → Member를 조회하는 SELECT가 **개별 실행**

> 결과적으로 1 (Post 조회) + N (Author 조회)이 발생한다.

이게 바로 **N+1 문제**다.

## 2. @EntityGraph를 붙이면 뭐가 달라질까?

같은 조회 메서드에 `@EntityGraph`를 붙여보자.

```java
@EntityGraph(attributePaths = {"author"})
List<Post> findAll();
```

겉으로 보기엔 쿼리도 안 바뀌고, `join fetch` 같은 것도 안 보인다.

**하지만 JPA 내부에서는 아주 중요한 변화가 생긴다.**

---

## 3. @EntityGraph의 정체: "Fetch 전략 힌트"

`@EntityGraph`는 JPA에게 이런 힌트를 전달한다.

> "이 조회에서는 author 연관을 LAZY로 두지 말고 조회 시점에 함께 로딩해라."

엔티티에 정의된 `fetch = LAZY` 설정을 무시하고, **이번 조회에 한해서 fetch 전략을 override**하는 것이다.

---

## 4. 실제로 생성되는 SQL 비교

**@EntityGraph가 없는 경우**

```sql
-- Post 조회
select p.id, p.title from post p;

-- 이후 각 Post마다
select m.id, m.name from member m where m.id = ?;
```

**@EntityGraph가 있는 경우**

```sql
select
    p.id, p.title,
    m.id, m.name
from post p
         join member m on p.author_id = m.id;
```

> **핵심**: SQL 레벨에서 이미 JOIN이 걸려 있고, author는 프록시가 아니라 **완전히 초기화된 엔티티**다.

---

## 왜 N+1이 "아예" 안 생길까?

차이를 객체 관점에서 보면 더 명확하다.

### 기본 LAZY 로딩

- `author` = **프록시 객체**
- 접근 시점에 **DB 조회 발생**

### @EntityGraph 적용 후

- `author` = **이미 로딩된 실제 엔티티**
- 접근해도 **DB에 갈 이유가 없음**

> **추가 SELECT가 발생할 조건 자체가 사라진다.**

---

## Fetch Join과 EntityGraph의 관계

많이들 이렇게 정리한다.

> **@EntityGraph = 쿼리 문자열이 없는 fetch join**

구분 | Fetch Join | EntityGraph
--- | --- | ---
JOIN 지정 | JPQL에 직접 | 메서드에 선언
내부 동작 | 동일 | 동일
성능 | 동일 | 동일
차이점 | 쿼리 중심 | 선언형

**성능 차이는 없고 표현 방식만 다르다.**

---

## 컬렉션에도 적용되긴 한다 (주의)

```java
@EntityGraph(attributePaths = {"comments"})
```

이 경우도 내부적으로는 fetch join이다.

- N+1은 해결됨
- 하지만 row 수 증가
- 페이징과 함께 쓰면 위험

> **N+1은 막아주지만 fetch join이 가진 제약도 그대로 따른다.**

---

## Batch Fetch와의 차이점

항목 | EntityGraph | Batch Fetch
--- | --- | ---
쿼리 수 | 1 | 1 + (N / batch)
방식 | JOIN | IN
N+1 완전 제거 | O | X
페이징 안정성 | toOne만 OK | O

- **EntityGraph**: N+1 완전 제거
- **Batch Fetch**: N+1 완화

---

## 언제 @EntityGraph가 가장 좋은 선택일까?

**목록 화면에서 항상 같이 필요한 toOne 연관**
- 작성자
- 상태
- 카테고리

**JPQL을 최대한 숨기고 싶을 때**
- 메서드 네이밍 쿼리 유지
- Specification 패턴 유지

> 특히 **"목록 + 작성자" 패턴**은 `@EntityGraph` 하나로 N+1의 대부분을 정리할 수 있다.

---

## 정리

`@EntityGraph`는 마법이 아니다.

**JPA에게 JOIN을 강제하는 힌트다.**

조회 시점에 연관 엔티티를 로딩하게 만들어 프록시 접근 자체를 없애고, 그 결과 N+1이 발생하지 않게 한다.

---

### 한 줄 요약

> `@EntityGraph`는 **"연관 접근 시점"**이 아니라 **"조회 시점"**에 모든 걸 가져오게 만들어 N+1 문제를 원천 차단한다.