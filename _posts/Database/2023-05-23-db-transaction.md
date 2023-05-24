---
layout: post
title: "Database 이해하기 #1"
subtitle: "DB Transaction이란"
date: 2023-05-23 18:09:00+0900
categories: Database
tags: Transaction DeadLock
mathjax: true
---

# DB Transaction

DB Transaction은 DBMS 또는 이와 유사한 시스템에서 사용되는 상호 작용의 단위입니다.  
즉, 시스템을 변환시키는 하나의 논리적 기능을 수행하기 위한 작업의 단위로, 한번에 모두 수행되어야 할 일련의 연산들을 의미합니다.

## Transaction의 성질

ACID(원자성, 일관성, 고립성, 지속성)는 데이터베이스 Transaction이 안전하게 수행된다는 것을 보장하기 위한 성질을 가리키는 약어입니다.

- Atomicity(원자성) : 데이터베이스에 모두 반영이 되던지, 전혀 반영되지 않던지 해야 한다.
- Consistency(일관성) : 수행 전과 완료 후의 시스템의 상태가 같아야 한다.
- Isolation(독립성) : Transaction는 각각 독립적으로 수행되며, 다른 연산에 영향을 끼칠 수 없다.
- Durability(영구성) : 연산이 정상적으로 완료된 이후에는 영구적으로 반영이 되어야 한다.

## Transaction 연산

Transaction은 시스템에 적용하기 위한 연산으로 Commit와 Rollback이 있습니다.

- Commit : Transaction의 모든 작업이 성공적으로 완료 된 것을 Transaction 관리자에 알려주는 연산
- Rollback : Transaction의 작업 중 일부가 비정상적으로 종료되어 데이터베이스의 일관성을 깨뜨렸을 때, 해당 Transaction이 행한 모든 작업을 취소(
  Undo)하는 연산

## Transaction 상태

![transaction_status](/resource/20230523/20230523-image-1.png)

- Active(활동) : Transaction이 실행 중인 상태
- Failed(실패) : Transaction 실행 중 오류가 발생하여 중단된 상태
- Aborted(철회) : Transaction이 비정상적으로 종료되어 Roolback 연산을 요청한 상태
- Partially Committed) : Transaction 연산이 정상적으로 수행되었으며 Commit 연산을 요청하기 전 상태
- Committed(완료) : Transaction의 모든 작업이 정상적으로 수행되어, Commit 연산을 실행한 상태

## Isolation Level

Transaction의 ACID를 엄격하게 준수하면, 데이터의 적합성은 보장 할 수 있지만 동시성 효율은 매우 떨어지게 됩니다.  
이러한 Trade-off 관계에서 데이터베이스는 서로 다른 Transaction이 어느 정도 허용이 가능하도록 격리 수준을 지원합니다.  
(Level 수준이 높을 수록 엄격한 격리 수준을 제공)

| Name             | Level | Dirty Read | Non-Repeatable Read | Phantom Read | 정합성 | 동싱성 |
|------------------|-------|------------|---------------------|--------------|-----|-----|
| Serializable     | 3     | X          | X                   | X            | 높다  | 낮다  |
| Repeatable Read  | 2     | X          | X                   | O            | 중간  | 중간  |
| Read Committed   | 1     | X          | O                   | O            | 중간  | 중간  |
| Read Uncommitted | 0     | O          | O                   | O            | 낮다  | 높다  |

- Dirty Read : 다른 Transaction에 의해 수정되었지만, 아직 커밋되지 않은 데이터를 읽어 발생하는 오류
- Non-Repeatable Read : Transaction에서 같은 데이터를 여러번 조회 할 때, 조회 결과가 상이한 현상(다른 Transaction에서 데이터를 수정함)
- Phantom Read : 한 Transaction에서 일점 범위의 레코드를 처음 조회 할땐 없던 유령 레코드가 그 다음 조회 시에 나타나는 현상

### Serializable

Transaction이 사용 중인 테이블의 모든 Row에 대한 접근을 제한합니다.  
이 격리 수준에서는 단순한 Select 쿼리가 실행되더라도, 다른 Transaction이 데이터에 접근 할 수 없습니다.  
가장 높은 데이터 접합성을 보장하지만, 그만큼 성능은 가장 느립니다.

### Repeatable Read

Transaction이 Active 될 때 수행한 시간을 기록하고, 해당 시점을 기준으로 consistent read를 수행합니다.  
하지만 새로운 Row가 추가 되는 것을 막지는 않습니다.

__* consistent read__ : Read operation을 수행 할 때, 현재 DB의 값이 아닌 특정 시점의 snapshot을 읽어 오는 것

### Read Committed

Transaction은 읽기 연산 마다 DB Snapshot를 생성합니다.
이로 인해, 커밋이 완료된 다른 Transaction의 변경 사항은 consistent read 시 반영됩니다.  
대부분의 DBMS가 기본 모드로 채택하고 있는 격리 수준입니다.

### Read Uncommitted

커밋이 되지 않은 데이터 변경을 다른 Transaction이 조회 가능하도록 허용하는 격리 수준입니다.  
데이터 부정합 문제가 발생할 확률은 높아지지만, 그만큼 성능은 가장 빠릅니다.

 

