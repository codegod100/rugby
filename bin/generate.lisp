(require "asdf")

(let* ((script-path (or *load-truename*
						(merge-pathnames "bin/generate.lisp" (uiop:getcwd))))
	  (script-dir (uiop:pathname-directory-pathname (uiop:truenamize script-path)))
	  (project-root (uiop:truenamize (or (uiop:pathname-parent-directory-pathname script-dir)
								  script-dir))))
  (pushnew project-root asdf:*central-registry*
					 :test #'uiop:pathname-equal))

(let* ((home (uiop:physicalize-pathname (user-homedir-pathname)))
			 (setup (merge-pathnames "quicklisp/setup.lisp" home)))
	(when (probe-file setup)
		(load setup)))

(unless (asdf:find-system :parenscript nil)
	(if (find-package '#:ql)
			(ql:quickload :parenscript)
			(error "Parenscript ASDF system not found. Install it via Quicklisp or add it to ASDF's source registry.")))

(asdf:load-system :ps-asc-demo)

(ps-asc-demo:generate-artifacts)

(uiop:quit 0)
