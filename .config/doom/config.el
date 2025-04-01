;;; $DOOMDIR/config.el -*- lexical-binding: t; -*-

;; Place your private configuration here! Remember, you do not need to run 'doom
;; sync' after modifying this file!


;; Some functionality uses this to identify you, e.g. GPG configuration, email
;; clients, file templates and snippets. It is optional.
;; (setq user-full-name "John Doe"
;;       user-mail-address "john@doe.com")

;; Doom exposes five (optional) variables for controlling fonts in Doom:
;;
;; - `doom-font' -- the primary font to use
;; - `doom-variable-pitch-font' -- a non-monospace font (where applicable)
;; - `doom-big-font' -- used for `doom-big-font-mode'; use this for
;;   presentations or streaming.
;; - `doom-symbol-font' -- for symbols
;; - `doom-serif-font' -- for the `fixed-pitch-serif' face
;;
(setq doom-font (font-spec :family "JetBrainsMono Nerd Font" :size 16)
      doom-variable-pitch-font (font-spec :family "JetBrainsMono Nerd Font" :size 16)
      doom-big-font (font-spec :family "JetBrainsMono Nerd Font" :size 20)
      doom-symbol-font (font-spec :family "JetBrainsMono Nerd Font" :size 16)
      doom-serif-font (font-spec :family "JetBrainsMono Nerd Font" :size 16))

;; Remap 'Ctrl + /' to toggle comments
(map! :nv "C-/" #'evilnc-comment-or-uncomment-lines)

;; Enable Vim-style navigation in menus and pop-ups
(map! :map evil-motion-state-map
      "j" #'next-line
      "k" #'previous-line
      "h" #'backward-char
      "l" #'forward-char)


;; Enable company autocomplete
(add-hook 'sh-mode-hook 'company-mode)
(add-hook 'prog-mode-hook 'company-mode)

;; Add company-files backend for path completion
(after! company
  (add-to-list 'company-backends 'company-files))


(setenv "PATH" (concat "/usr/bin:" (getenv "PATH")))
(add-to-list 'exec-path "/usr/bin")

;; See 'C-h v doom-font' for documentation and more examples of what they
;; accept. For example:
;;
;;(setq doom-font (font-spec :family "Fira Code" :size 12 :weight 'semi-light)
;;      doom-variable-pitch-font (font-spec :family "Fira Sans" :size 13))
;;
;; If you or Emacs can't find your font, use 'M-x describe-font' to look them
;; up, `M-x eval-region' to execute elisp code, and 'M-x doom/reload-font' to
;; refresh your font settings. If Emacs still can't find your font, it likely
;; wasn't installed correctly. Font issues are rarely Doom issues!

;; There are two ways to load a theme. Both assume the theme is installed and
;; available. You can either set `doom-theme' or manually load a theme with the
;; `load-theme' function. This is the default:
;; (setq doom-theme 'doom-one)

;; This determines the style of line numbers in effect. If set to `nil', line
;; numbers are disabled. For relative line numbers, set this to `relative'.
(setq display-line-numbers-type nil)

;; (setq hl-line-mode nil)
(setq global-hl-line-mode -1)

;; (setq doom-theme 'doom-peacock)
(setq doom-theme 'doom-gruvbox)

;; If you use `org' and don't want your org files in the default location below,
;; change `org-directory'. It must be set before org loads!
(setq org-directory "~/org/")

(setq mouse-wheel-scroll-amount '(0.07))
(setq mouse-wheel-progressive-speed nil)
(setq ring-bell-function 'ignore)

(setq confirm-kill-emacs nil)

;; Whenever you reconfigure a package, make sure to wrap your config in an
;; `after!' block, otherwise Doom's defaults may override your settings. E.g.
;;
;;   (after! PACKAGE
;;     (setq x y))
;;
;; The exceptions to this rule:
;;
;;   - Setting file/directory variables (like `org-directory')
;;   - Setting variables which explicitly tell you to set them before their
;;     package is loaded (see 'C-h v VARIABLE' to look up their documentation).
;;   - Setting doom variables (which start with 'doom-' or '+').
;;
;; Here are some additional functions/macros that will help you configure Doom.
;;
;; - `load!' for loading external *.el files relative to this one
;; - `use-package!' for configuring packages
;; - `after!' for running code after a package has loaded
;; - `add-load-path!' for adding directories to the `load-path', relative to
;;   this file. Emacs searches the `load-path' when you load packages with
;;   `require' or `use-package'.
;; - `map!' for binding new keys
;;
;; To get information about any of these functions/macros, move the cursor over
;; the highlighted symbol at press 'K' (non-evil users must press 'C-c c k').
;; This will open documentation for it, including demos of how they are used.
;; Alternatively, use `C-h o' to look up a symbol (functions, variables, faces,
;; etc).
;;
;; You can also try 'gd' (or 'C-c c d') to jump to their definition and see how
;; they are implemented.

;; lsp
;; (use-package! lsp-mode
;;   :ensure t
;;   :hook ((c-mode . lsp)
;; 	 (c++-mode . lsp)
;;          (lsp-mode . lsp-enable-which-key-integration))
;;   :commands lsp
;;   :config
;;   (setq lsp-keymap-prefix "C-c l")
;;   (define-key lsp-mode-map (kbd "C-c l") lsp-command-map)
;;   (setq lsp-file-watch-threshold 15000))

;; (use-package! lsp-ui
;;   :ensure t
;;   :commands (lsp-ui-mode)
;;   :config
;;   (setq lsp-ui-doc-enable nil)
;;   (setq lsp-ui-doc-delay 0.5)
;;   (define-key lsp-ui-mode-map [remap xref-find-definitions] #'lsp-ui-peek-find-definitions)
;;   (define-key lsp-ui-mode-map [remap xref-find-references] #'lsp-ui-peek-find-references)
;;   )

;; (use-package! lsp-ivy
;;   :ensure t
;;   :commands lsp-ivy-workspace-symbol)

;; (use-package! lsp-treemacs
;;   :ensure t
;;   :commands lsp-treemacs-errors-list)

;; ;; company
;; (use-package! company
;;   :ensure t
;;   :bind ("M-/" . company-complete-common-or-cycle) ;; overwritten by flyspell
;;   :init (add-hook 'after-init-hook 'global-company-mode)
;;   :config
;;   (setq company-show-numbers            t
;; 	company-minimum-prefix-length   1
;; 	company-idle-delay              0.5
;; 	company-backends
;; 	'((company-files          ; files & directory
;; 	   company-keywords       ; keywords
;; 	   company-capf           ; what is this?
;; 	   company-yasnippet)
;; 	  (company-abbrev company-dabbrev))))

;; (use-package! company-box
;;   :ensure t
;;   :after company
;;   :hook (company-mode . company-box-mode))

;; ;; flycheck
;; (use-package! flycheck

;;   :ensure t
;;   :init (global-flycheck-mode)
;;   :config
;;   (setq flycheck-emacs-lisp-load-path 'inherit)
;;   (setq flycheck-display-errors-function
;; 	#'flycheck-display-error-messages-unless-error-list)

;;   (setq flycheck-indication-mode nil))

;; ;; (use-package! flycheck-pos-tip
;; ;;   :ensure t
;; ;;   :after flycheck
;; ;;   :config
;; ;;   (flycheck-pos-tip-mode))

;; (use-package! ccls
;;   :ensure t
;;   :config
;;   :hook ((c-mode c++-mode objc-mode cuda-mode) .
;;          (lambda () (require 'ccls) (lsp)))
;;   (setq ccls-executable "/usr/local/bin/ccls")
;;   (setq ccls-initialization-options
;; 	'(:index (:comments 2) :completion (:detailedLabel t)))
;;   )

;; (use-package! srefactor
;;   :ensure t
;;   :config
;;   (semantic-mode 1)
;;   (define-key c-mode-map (kbd "M-RET") 'srefactor-refactor-at-point)
;;   (define-key c++-mode-map (kbd "M-RET") 'srefactor-refactor-at-point)
;;   )

(setq TeX-command-default "LatexMk")
(setq TeX-engine 'default)
(setq TeX-save-query nil)
(setq TeX-show-compilation t)

;;pdflatex 
;; (after! tex
;;   (add-to-list 'TeX-command-list
;;                '("LatexMk" "latexmk -pdf -synctex=1 -interaction=nonstopmode %s"
;;                  TeX-run-TeX nil t :help "Run LatexMk"))
;;   (setq TeX-view-program-selection '((output-pdf "Zathura")))
;;   (setq TeX-source-correlate-mode t)
;;   (setq TeX-source-correlate-start-server t))


;; xelatex
(after! tex
  (setq TeX-engine 'xetex)
  (add-to-list 'TeX-command-list
               '("XeLaTeX" "latexmk -xelatex -synctex=1 -interaction=nonstopmode %s"
                 TeX-run-TeX nil t :help "Run XeLaTeX with latexmk")))
(setq TeX-command-default "XeLaTeX")



;; compile on save
;; (defun my/latex-auto-compile-on-save ()
;;   (add-hook 'after-save-hook
;;             (lambda ()
;;               (TeX-command "LatexMk" 'TeX-master-file))
;;             nil t))

;; (add-hook! LaTeX-mode #'my/latex-auto-compile-on-save)


;; compile automatically
;; (after! tex
;;   (add-to-list 'TeX-command-list
;;                '("LatexMkPvc"
;;                  "latexmk -pdf -pvc -synctex=1 -interaction=nonstopmode %s"
;;                  TeX-run-TeX nil t :help "Run latexmk continuously"))
;;   (setq TeX-command-default "LatexMkPvc"))


;; (after! tex
;;   (setq TeX-command-extra-options "-shell-escape")
;;   (add-to-list 'TeX-command-list
;;                '("LatexMkShellEscape"
;;                  "latexmk -pdf -shell-escape -synctex=1 -interaction=nonstopmode %s"
;;                  TeX-run-TeX nil t :help "Run latexmk with shell-escape"))
;;   (setq TeX-command-default "LatexMkShellEscape"))

;; be less picky about errors
;; (setq TeX-error-overview-open-after-TeX-run t)



;; (after! tex
;;   ;; Use xelatex and enable shell-escape
;;   (setq TeX-engine 'xetex
;;         TeX-command-extra-options "-shell-escape"
;;         TeX-save-query nil
;;         TeX-show-compilation t)

;;   ;; latexmk with shell escape
;;   (add-to-list 'TeX-command-list
;;                '("LatexMkXeLaTeX"
;;                  "latexmk -xelatex -shell-escape -synctex=1 -interaction=nonstopmode %s"
;;                  TeX-run-TeX nil t :help "Run latexmk with xelatex and shell-escape"))

;;   (setq TeX-command-default "LatexMkXeLaTeX")

;;   ;; Optional: auto-refresh viewer (Zathura, PDF Tools, etc.)
;;   (setq TeX-source-correlate-mode t
;;         TeX-source-correlate-start-server t)

;;   ;; Revert PDF after compilation
;;   (add-hook 'TeX-after-compilation-finished-functions
;;             #'TeX-revert-document-buffer))


;; (after! tex
;;   ;; Always clean before compile to avoid latexmk getting stuck
;;   (setq TeX-clean-confirm nil
;;         TeX-save-query nil
;;         TeX-show-compilation t)

;;   ;; Force shell-escape + xelatex always
;;   (setq TeX-engine 'xetex
;;         TeX-command-extra-options "-shell-escape")

;;   ;; Clean default command list
;;   (setq TeX-command-list nil)

;;   ;; Add latexmk with xelatex + shell-escape
;;   (add-to-list 'TeX-command-list
;;                '("LatexMkXeLaTeX"
;;                  "latexmk -xelatex -shell-escape -synctex=1 -interaction=nonstopmode %s"
;;                  TeX-run-TeX nil t :help "Run latexmk with xelatex and shell-escape"))

;;   ;; Set it as default
;;   (setq TeX-command-default "LatexMkXeLaTeX")

;;   ;; Auto-recompile on save using save-hook
;;   (add-hook 'TeX-after-compilation-finished-functions
;;             #'TeX-revert-document-buffer)

;;   ;; Optional: compile on save without -pvc
;;   (add-hook 'LaTeX-mode-hook
;;             (lambda ()
;;               (add-hook 'after-save-hook
;;                         (lambda ()
;;                           (TeX-command "LatexMkXeLaTeX" 'TeX-master-file))
;;                         nil t))))


(after! tex
  ;; Remove any previous weird default
  (setq TeX-command-default "XeLaTeX")

  ;; Set engine and shell-escape globally
  (setq TeX-engine 'xetex
        TeX-command-extra-options "-shell-escape")

  ;; Clean slate: define only one good command
  (setq TeX-command-list
        '(("XeLaTeX"
           "latexmk -xelatex -shell-escape -synctex=1 -interaction=nonstopmode %s"
           TeX-run-TeX nil t :help "Run latexmk with xelatex")))

  ;; Set default viewer to pdf-tools or zathura (your choice)
  (setq TeX-view-program-selection '((output-pdf "Zathura")))

  ;; Revert PDF buffer after compile
  (add-hook 'TeX-after-compilation-finished-functions
            #'TeX-revert-document-buffer)

  ;; Auto compile on save
  (add-hook 'LaTeX-mode-hook
            (lambda ()
              (add-hook 'after-save-hook
                        (lambda ()
                          (TeX-command "XeLaTeX" 'TeX-master-file))
                        nil t))))
