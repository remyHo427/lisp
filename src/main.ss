(define member?
    (lambda (a lat)
        (if (null? lat)
            #f
            (if (= (car lat) a)
                #t
                (member? a (cdr lat))))))

(p (member? 3 '(1 2 3)))