(define fact
    (lambda (x)
      (if (= 0 x)
          1
          (* x (fact (- x 1))))))

(define bino
    (lambda (n k)
        (/ (fact n) (* (fact k) (fact (- n k))))))