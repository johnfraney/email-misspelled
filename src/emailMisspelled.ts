import { containsOneAt } from "helpers/containsOneAt"
import { getDomain } from "helpers/getDomain"
import { stringLengthChecker, StringLengthChecker } from "stringLengthChecker"
import { lettersComparison, LettersComparison } from "lettersComparison"
import { domainMapper } from "helpers/domainMapper"
import { corrector, Corrector } from "helpers/corrector"
import { sortByCount } from "helpers/sort"
// import { Result } from "interfaces/Result.interface"
export interface Result {
	suggest: string
	corrected: string
	original: string
	misspelledCount: number
}

export interface EmailMisspelled {
	(email: string): Result[]
}
export type EmailMisspelledConstructor = {
	(config: {
		/** Maximum length difference between strings; Default: 2 */
		lengthDiffMax?: number
		/** Number of misspelled error allowed; Default: 2 */
		maxMisspelled?: number
		/** List of email domain to compare */
		domains: string[]
	}): EmailMisspelled
}

const DEFAULT_LENGTH = 2
const MAX_MISSPELLED = 2

export const emailMisspelled: EmailMisspelledConstructor = ({
	lengthDiffMax = DEFAULT_LENGTH,
	maxMisspelled = MAX_MISSPELLED,
	domains,
}) => {
	if (!!!domains || !Array.isArray(domains)) throw new Error("Please provide a domain list")

	return email => {
		if (!containsOneAt(email) || !!!domains?.length) return []

		const domain: string = getDomain(email)
		if (domains.includes(domain)) return []

		const sizeFilter: StringLengthChecker = stringLengthChecker(domain, lengthDiffMax)
		const letterFilter: LettersComparison = lettersComparison(domain, maxMisspelled)
		const correctorMapper: Corrector = corrector(email)

		const remainsDomains: Result[] = domains
			.filter(sizeFilter)
			.map(domainMapper)
			.filter(letterFilter)
			.map(correctorMapper)
			.sort(sortByCount)

		return !!remainsDomains.length ? remainsDomains : []
	}
}
export default emailMisspelled
