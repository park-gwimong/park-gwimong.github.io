---
layout: post
title: "Jekyll 설치"
date: 2019-03-06 20:00:00+0900
categories: Utillity
tags: Ubuntu18.04 LubyGem
mathjax: true
---

현재 운영 중인 블로그는 Jekyll을 이용하여 Gaohaoyang님의 테마를 적용하였습니다.  
Jekyll 설치 관련하여서는 많은 글들이 있지만, 나중에 다시 환경을 구성해야 할 경우에 참고하기 위한 기록입니다.  


# 설치 환경
OS : Ubuntu18.04LTS on Windows10


# 필요 프로그램 설치

- Ruby
~~~
> sudo apt install ruby
> sudo apt install ruby-dev
~~~


# Jekyll 설치
- Jekyll
- jekyll-paginate : jekyll에서 페이징 처리 하기 위한 gem
~~~
> sudo gem install jekyll
> sudo gem install jekyll-paginate
~~~

# Jekyll 실행
- jekyll server --port [port 번호] --host [site]
- 옵션들 생략 가능 : jekyll s
~~~
> jekyll s
~~~


