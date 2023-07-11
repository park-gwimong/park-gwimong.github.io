---
layout: post
title: "plantuml로 Software Architecture 작성하기"
subtitle: "C4 Model과 plantuml"
date: 2023-07-10 18:11:00+0900
categories: [ Tools ]
tags: [ "Plantuml", "C4 model" ]
mathjax: true
---

Software architecture를 표현하기 위한 다양한 방법들이 있지만, 저는 시스템을 분석 및 설계할 때 주로 아래의 문서를 작성합니다.

- Software Requirements Specification(Functional Specification)
- Usecase Diagram
- System Architecture Diagram
- Infra Architecture Diagram
- UI Wireframe
- Entity Relationship Diagram
- Sequence Diagram
- Data Flow Diagram
- Status Flow Diagram

초기에는 Microsoft PowerPoint로 모든 아키텍처를 표현했었습니다.  
단순한 시스템 구성도에서부터 다양한 다이어그램까지(시퀀스 다이어그램, 액티브 다이어그램, ERD 등), 거의 모든 문서를 MS PowerPoint 하나로 해결 할 수 있었습니다.  
(물론 지금도 가장 많이 사용하고 있는 도구 중 하나입니다.)

MS PowerPoint는 분명 만능의 도구이지만, 그 만큼 자유도가 높아 매번 다른 스타일의 문서가 생성되었고, 지속적으로 관리가 되지 않았습니다.  
이러한 설계 문서는 작성하는 것도 중요하지만, 관리도 매우 중요합니다.

보통 시스템 분석 및 설계 시 열심히 작성해 놓고, 그 이후에는 잘 보지 않는 경우가 많았습니다.  
왜냐하면 초기 설계 이후로 변경된 내용들을 지속적으로 갱신 하지 않았기 때문입니다.

좀 더 체계적으로 사용할 수 있는 방법을 찾아보며 다양한 도구들을 사용해보았습니다.

그러다 최근 정착하게 된 도구가 plantuml입니다.

# PlantUML

PlantUML은 사용자가 일반 텍스트 언어로 다이어그램을 작성할 수 있는 오픈 소스 도구입니다.  
일반 텍스트 언어로 작성하기때문에 기존에 사용 중인 소스 형상 관리 도구에 그대로 적용 할 수 있습니다.  

예를 들어, Git과 같은 형상 관리 서버의 해당 프로젝트 내에서 설계 문서를 함께 관리 할 수 있습니다.

또한, 다양한 다이어그램을 작성 할 수 있어 설계 문서의 양식을 통일 할 수 있습니다.  
- 시퀀스 다이어그램
- 유스케이스 다이어그램
- 클래스 다이어그램
- 객체 다이어그램
- 액티비티 다이어그램 (예전 문법은 여기에)
- 컴포넌트 다이어그램
- 배치 다이어그램
- 상태 다이어그램
- 타이밍 다이어그램


---

# C4 Model

[C4 Model](https://c4model.com/)은 소프트웨어 시스템의 아키텍처를 모델링하기 위한 그래픽 표기법 중 하나로,

UML과 [4+1 아키텍처 뷰 모델](https://en.wikipedia.org/wiki/4%2B1_architectural_view_model)을 기반으로

__시스템을 계층 수준에 따라 시각적으로__ 표현하고 이를 문서화합니다.

- Level 1 : 범위 내 시스템과 사용자 및 다른 시스템과의 관계(=System Diagram)

- Level 2 : 시스템을 상호 관련된 컨테이너로 분해(=Container Diagram)

- Level 3 : 컨테이너를 상호 관련된 구성 요소로 분해(=Component Diagram)

- Level 4 : 코드에 맵핑 할 수 있는 수준으로 분해(=Code Diagram)


## C4-PlantUML
[C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML)은 PlantUML로 다이어그램을 생성하기 위한 매크로로 스트레오타입 등이 정의되어 있습니다.  
(PlantUML이 제공되는 다이어그램에 C4 Model 스타일을 적용)  

지원되는 다이어그램 목록 :
- 시스템 컨텍스트 및 시스템 환경 다이어그램
- 컨테이너 다이어그램
- 구성 요소 다이어그램
- 동적 다이어그램
- 배포 다이어그램
- 시퀀스 다이어그램