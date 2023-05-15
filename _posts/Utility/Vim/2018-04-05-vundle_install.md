---
layout: post
title: "vim plugin 설정"
date: 2018-04-05 17:45:00+0900
categories: Utillity
tags: Vim Plugin Configure
mathjax: true
---

# [Vundle](https://github.com/VundleVim/Vundle.vim)이란?
Vim Bundle. Vim의 Plugin manager으로 Vim에 다양한 확장 기능들을 설치하여 사용 할 수 있도록 도와줍니다.

# Install
1. git에서 Vundle 다운로드
~~~
git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim
~~~
2. vimrc에 vundle 설정 부분을 추가
```viml
set nocompatible
filetype off
set rtp+=~/.vim/bundle/Vundle.vim
let path='~/.vim/bundle'
call vundle#begin(path)
call vundle#end()
filetype plugin indent on
```
3. vundle#begin()과 vundle#end() 사이에 필요한 plugin을 추가
```viml
call vundle#begin(path)
Plugin 'gmarik/Vundle.vim'
Plugin 'tpope/vim-fugitive'
Plugin 'The-NERD-Tree'
Plugin 'bling/vim-airline'
Plugin 'tomasr/molokai'
Plugin 'nathanaelkane/vim-indent-guides'
call vundle#end()
```

4. plugin 적용   
vim 명령 모드에서 PluginInstall 입력
```viml
:PluginInstall
```
완료 시 q로 종료.

5. plugin 삭제   
vimrc에서 삭제하고자 하는 Plugin을 제거 후, vim 명령 모드에서 PluginClean 입력
```viml
:PluginClean
```
완료 시 q로 종료.
