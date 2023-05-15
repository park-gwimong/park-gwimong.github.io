---
layout: post
title: "vim 설정"
date: 2018-04-04 18:00:00+0900
categories: Utillity
tags: Vim Configure
mathjax: true
---



# 주요 옵션

Option|Abbreviation|Description
----------------|-----------|-----------------------------------------------------------
'autoindent'	| 'ai'		| Copy indent from current line when starting a new line.
'cindent'		| 'cln'		| Enables automatic C program indenting.
'smartindent'	| 'si'		| Do smart autoindenting when starting a new line.
'tabstop'		| 'ts'		| Number of spaces that a <Tab> in the file counts for.
'shiftwidth'	| 'sw'		| Number of spaces to use for each step of (auto)indent
'visualbell'	| 'vb'		| Use visual bell instead of beeping.
'number'		| 'nu'		| Print the line number in front of each line.
'ruler'			| 'ru'		| Show the line and column number of the cursor position, separated by a comma.
'title'			| 			| When on, the title of the window will be set to the value of 'titlestring'
'warp'			|			| This option changes how text is displayed.
'cursorline'	| 'cul'		| Highlight the screen line of the cursor with CursorLine.
'linebreak'		| 'lbr'		| If on Vim will wrap long lines at a character in 'breakat' rather than at the last character that fits on the screen.
'showmatch'		| 'sm'		| When a bracket is inserted, briefly jump to the matching one.
'background'	| 'bg'		| When set to "dark", Vim will try to use colors that look good on a dark background.  When set to "light", Vim will try to use colors that look good on a light background.
'guifont'		| 'gnf'		| This is a list of fonts which will be used for the GUI version of Vim. 
'wrapscan'		| 'ws'		| Searches wrap around the end of the file.
'hlsearch'		| 'hls'		| When there is a previous search pattern, highlight all its matches.
'ignorecase'	| 'ic'		| Ignore case in search patterns.
'incsearch'a	| 'is'		| While typing a search command, show where the pattern, as it was typed so far, matches.
'backspace'		| 'bs'		| Influences the working of &lt;BS&gt;, &lt;Del&gt;, CTRL-W and CTRL-U in Insert mode.
'history'		| 'hi'		| A history of ":" commands, and a history of previous search patterns are remembered.
'fileencoding'	| 'fencs'	| This is a list of character encodings considered when starting to edit an existing file.
'backup'		| 'bk'		| Make a backup before overwriting a file.
'syntax'		| 'syn'		| 

[전체 옵션](http://vimdoc.sourceforge.net/htmldoc/options.html)


# 옵션 설정
* `on/off` 로 값을 설정. 
```vim
set number              " number 옵션을 Onset nonumber            " number 옵션을 Off
```

* 설정 값이 `숫자`인 옵션
```vim
set history=1000        " history 옵션 값을 1000으로 설정.
```
* 설정 값이 `문자열`인 옵션
```vim
set background=dark     " backupground 옵션을 dark로 설정.
```

* 여러 옵션을 지정
```vim
set guifont=NanumGothicCoding:h12:cHANGEUL      " guifont 설정.
```


# 옵션 적용
* 현재 사용 중인 vim에 적용
명령 모드에서 옵션 입력
```viml
:set number
```

* 항상 vim에 옵션 적용
/etc/vim/vimrc에 해당 옵션을 추가
```vim
set number
```

# 현재 적용 중인 vim 설정
```vim
" All system-wide defaults are set in $VIMRUNTIME/debian.vim and sourced by
" the call to :runtime you can find below.  If you wish to change any of those
" settings, you should do it in this file (/etc/vim/vimrc), since debian.vim
" will be overwritten everytime an upgrade of the vim packages is performed.
" It is recommended to make changes after sourcing debian.vim since it alters
" the value of the 'compatible' option.

" This line should not be removed as it ensures that various options are
" properly set to work with the Vim-related packages available in Debian.
runtime! debian.vim

" Uncomment the next line to make Vim more Vi-compatible
" NOTE: debian.vim sets 'nocompatible'.  Setting 'compatible' changes numerous
" options, so any other options should be set AFTER setting 'compatible'.
"set compatible

" Vim5 and later versions support syntax highlighting. Uncommenting the next
" line enables syntax highlighting by default.
if has("syntax")
  syntax on
endif

" If using a dark background within the editing area and syntax highlighting
" turn on this option as well
"set background=dark

" Uncomment the following to have Vim jump to the last position when
" reopening a file
"if has("autocmd")
"  au BufReadPost * if line("'\"") > 1 && line("'\"") <= line("$") | exe "normal! g'\"" | endif
"endif

" Uncomment the following to have Vim load indentation rules and plugins
" according to the detected filetype.
"if has("autocmd")
"  filetype plugin indent on
"endif

" The following are commented out as they cause vim to behave a lot
" differently from regular Vi. They are highly recommended though.
set showcmd		" Show (partial) command in status line.
"set showmatch		" Show matching brackets.
"set ignorecase		" Do case insensitive matching
"set smartcase		" Do smart case matching
"set incsearch		" Incremental search
"set autowrite		" Automatically save before commands like :next and :make
"set hidden		" Hide buffers when they are abandoned
"set mouse=a		" Enable mouse usage (all modes)

" Source a global configuration file if available
if filereadable("/etc/vim/vimrc.local")
  source /etc/vim/vimrc.local
endif


"----- INDENT -----
set autoindent
set cindent
set smartindent
set tabstop=2
set shiftwidth=2

"----- VIEW -----
set visualbell
set number
set ruler
set title
set wrap
set cursorline
set linebreak
set showmatch
set guifont=NanumGothicCoding:h12:cHANGEUL

"----- SEARCH -----
set nowrapscan
set hlsearch
set ignorecase
set incsearch

"----- EDIT -----
set backspace=eol,start,indent
set history=1000
set fencs=ucs-bom,utf-8,euc-kr,latin1
set fileencoding=utf-8
set nobackup

"<===== VUNDLE config Start =====>
" Brief help
" :PluginList       - lists configured plugins
" :PluginInstall    - installs plugins; append `!` to update or just
" :PluginUpdate
" :PluginSearch foo - searches for foo; append `!` to refresh local cache
" :PluginClean      - confirms removal of unused plugins; append `!` to auto-approve removal
" 
" see :h vundle for more details or wiki for FAQ
" Put your non-Plugin stuff after this line
"
set nocompatible
filetype off
set rtp+=~/.vim/bundle/Vundle.vim
let path='~/.vim/bundle'
call vundle#begin(path)

Plugin 'gmarik/Vundle.vim'
Plugin 'The-NERD-Tree'

"----- airline -----
Plugin 'bling/vim-airline'
Plugin 'Syntastic'
Plugin 'tpope/vim-fugitive'

"----- Color plugin -----
"Plugin 'molokai'
"Plugin 'aradunovic/perun.vim'

"----- Git plugin -----
Plugin 'airblade/vim-gitgutter'
Plugin 'gitview'

"Plugin 'Indent-Guides'
Plugin 'nathanaelkane/vim-indent-guides'
Plugin 'pangloss/vim-simplefold'

call vundle#end()
filetype plugin indent on
"<===== VUNDLE config End =====>


"----- VIM-AIRLINE -----
set laststatus=2

"---- COLOR SCHEME -----
"syntax on
"syntax enable
"colorscheme perun

":set listchars=tab:\|\ 
":set list
"

let g:indent_guides_enable_on_vim_startup = 1
let g:SimpylFold_docstring_preview=1

colorscheme molokai
let g:indent_guides_start_level = 2
let g:indent_guides_guide_size = 1

```

[참고] : <https://vimhelp.org/options.txt.html#option-summary>