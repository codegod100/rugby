;;;; ps-asc-demo.asd

(asdf:defsystem "ps-asc-demo"
  :description "Common Lisp + Parenscript to AssemblyScript demo"
  :version "0.1.0"
  :serial t
  :depends-on (:parenscript)
  :components ((:file "src/package")
               (:file "src/generator")))
