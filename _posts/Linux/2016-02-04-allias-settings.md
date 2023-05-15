---
layout: post
title: "Linux alias 설정"
date: 2016-02-04 13:46:00+0900
categories: Linux
tags: Setting Alias
mathjax: true
---


alias란 명령어의 별칭 개념입니다.  
명령을 수행하기 위해 여러 옵션이나 조합을 하다보면 명령어가 굉장히 길어지기도 합니다.  
이를 사용자가 정의한 명령어로 대체할 수 있도록 정의하는 것입니다.  



## 설정 방법
> alias [정의할 명령어]='[실제 명령어]'

부팅 될 때마다 적용하기 위해 설정 파일에 추가합니다.  

1. 특정 계정에서만 사용하고 싶은 경우 : ~/.bashrc

   바로 적용을 위해 
   ```bash
   source ~/.bashrc
   ```

2. 모든 계정에서 사용하고 싶은 경우 : /etc/profile





## 자주 사용하는 설정

```vim
alias vi='vim'

alias mv='mv -i'

alias rm='rm -i'

alias dir='ls -al'



# some more ls aliases

alias ll='ls -alF'

alias la='ls -A'

alias l='ls -CF'



# search command

alias gc='find . -name "*.c" | xargs grep -n '

alias gi='find . -name "*.h" | xargs grep -n '

alias gj='find . -name "*.java" | xargs grep -n '

alias gp='find . -name "*.cpp" | xargs grep -n '
```
